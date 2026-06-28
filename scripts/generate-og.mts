/**
 * 빌드 타임 OG 이미지 생성기.
 *
 * - 블로그 글: `src/content/blog/*.md`의 frontmatter를 읽어 글마다 PNG를 만듭니다.
 * - 정적 페이지: 홈/블로그 목록용 기본 PNG를 만듭니다.
 *
 * 산출물은 `public/og/` 아래에 저장되어 빌드 시 정적 자산으로 복사됩니다.
 * (predev/prebuild에서 sync-blog 다음에 실행)
 *
 * 캐시/무효화 전략:
 *   콘텐츠(제목·설명·작성자 등)와 렌더링 코드 버전(template.ts·ogImage.ts 내용
 *   해시)을 합쳐 SHA-256 해시를 만들어 `public/og/manifest.json`에 기록합니다.
 *   해시가 같으면 PNG 재생성을 건너뛰어 빌드를 빠르게 합니다. 콘텐츠뿐 아니라
 *   레이아웃·색상 등 템플릿을 고쳐도 캐시가 무효화됩니다. slug 기반 안정 파일명을
 *   쓰므로 URL은 변하지 않고, 콘텐츠가 바뀌면 동일 경로 파일이 교체되어 배포 시
 *   자연히 무효화됩니다.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { createOgTemplate, type OgNode } from "../src/og/template.ts";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "../src/og/ogImage.ts";
import { blogFrontmatterSchema } from "../src/content/blog/schema.ts";

const ROOT = join(import.meta.dirname, "..");
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const OUT_DIR = join(ROOT, "public", "og");
const BLOG_OUT_DIR = join(OUT_DIR, "blog");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");

/** 네비게이션과 동일한 브랜드 로고(아이콘+워드마크). */
const LOGO_PATH = join(ROOT, "public", "newLogoWithText.svg");

/** OG 카드 배경 이미지(컴포넌트 썸네일 패턴). */
const BACKGROUND_PATH = join(ROOT, "public", "og-background.png");

const FONT_REGULAR = join(
  ROOT,
  "node_modules",
  "pretendard",
  "dist",
  "public",
  "static",
  "Pretendard-Regular.otf",
);
const FONT_SEMIBOLD = join(
  ROOT,
  "node_modules",
  "pretendard",
  "dist",
  "public",
  "static",
  "Pretendard-SemiBold.otf",
);
const FONT_BOLD = join(
  ROOT,
  "node_modules",
  "pretendard",
  "dist",
  "public",
  "static",
  "Pretendard-Bold.otf",
);

/** 정적 페이지용 OG 작업 정의. */
interface OgJob {
  /** 산출 파일의 OUT_DIR 기준 상대 경로 (예: "blog/987.png"). */
  outRelative: string;
  template: Parameters<typeof createOgTemplate>[0];
}

/**
 * 매우 단순한 frontmatter 파서. sync-blog가 `key: "값"`(JSON 인용) 또는
 * `key: 값` 형태로만 쓰므로 그 범위만 처리합니다. 반환한 원시 레코드는
 * `blogFrontmatterSchema`(loader.ts와 동일)로 검증해 두 경로의 일관성을 강제합니다.
 */
function parseFrontmatter(raw: string): Record<string, string> | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if (value.startsWith('"')) {
      try {
        value = JSON.parse(value) as string;
      } catch {
        value = value.replace(/^"|"$/g, "");
      }
    }
    result[key] = value;
  }

  return result;
}

/**
 * 렌더링 코드(템플릿/규격) 버전. 입력이 같아도 이 값이 바뀌면 캐시가 무효화됩니다.
 * `src/og/template.ts`와 `src/og/ogImage.ts`의 내용 해시로, 레이아웃·색상·폰트
 * 크기 등을 수정하면 PNG가 자동 재생성됩니다.
 */
const RENDER_VERSION = await (async () => {
  const sources = await Promise.all(
    ["template.ts", "ogImage.ts"].map((name) =>
      readFile(
        fileURLToPath(new URL(`../src/og/${name}`, import.meta.url)),
        "utf8",
      ),
    ),
  );
  return createHash("sha256")
    .update(sources.join("\0"))
    .digest("hex")
    .slice(0, 16);
})();

/** OG 템플릿 입력으로 결정적 해시를 만듭니다(캐시 키). */
function hashJob(template: OgJob["template"]): string {
  return createHash("sha256")
    .update(`${RENDER_VERSION}\0${JSON.stringify(template)}`)
    .digest("hex")
    .slice(0, 16);
}

async function renderPng(node: OgNode, fonts: SatoriFonts): Promise<Buffer> {
  const svg = await satori(node as Parameters<typeof satori>[0], {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts,
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_IMAGE_WIDTH },
  });
  return Buffer.from(resvg.render().asPng());
}

type SatoriFonts = Parameters<typeof satori>[1]["fonts"];

/** 브랜드 로고 SVG를 Satori `<img>`용 data URI로 읽습니다. */
async function loadLogoDataUri(): Promise<string> {
  const svg = await readFile(LOGO_PATH, "utf8");
  const base64 = Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

/** 배경 PNG를 CSS `background-image`용 data URI로 읽습니다. */
async function loadBackgroundDataUri(): Promise<string> {
  const png = await readFile(BACKGROUND_PATH);
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function loadFonts(): Promise<SatoriFonts> {
  const [regular, semibold, bold] = await Promise.all([
    readFile(FONT_REGULAR),
    readFile(FONT_SEMIBOLD),
    readFile(FONT_BOLD),
  ]);
  // 디자인 시스템 fontWeights(src/tokens/typography.ts)와 동일한 굵기만 로드.
  return [
    { name: "Pretendard", data: regular, weight: 400, style: "normal" },
    { name: "Pretendard", data: semibold, weight: 600, style: "normal" },
    { name: "Pretendard", data: bold, weight: 700, style: "normal" },
  ];
}

/** 블로그 글 frontmatter를 OG 작업으로 변환합니다. */
async function collectBlogJobs(): Promise<OgJob[]> {
  if (!existsSync(BLOG_DIR)) return [];
  const entries = await readdir(BLOG_DIR);
  const jobs: OgJob[] = [];

  for (const name of entries) {
    if (!/\.mdx?$/.test(name)) continue;
    const slug = name.replace(/\.mdx?$/, "");
    const raw = await readFile(join(BLOG_DIR, name), "utf8");
    const parsed = parseFrontmatter(raw);
    // 라우트는 항상 /og/blog/<slug>.png를 참조하므로, 여기서 글을 건너뛰면 깨진
    // OG 이미지가 배포됩니다. loader.ts와 동일한 스키마로 검증하고, 실패하면
    // 빌드를 중단합니다(조용히 건너뛰지 않음).
    const fm = blogFrontmatterSchema.safeParse(parsed);
    if (!fm.success) {
      throw new Error(
        `[generate-og] frontmatter 검증 실패: ${name}\n${fm.error.message}`,
      );
    }
    jobs.push({
      outRelative: `blog/${slug}.png`,
      template: {
        title: fm.data.title,
        author: fm.data.author,
        date: fm.data.date,
        eyebrow: "블로그",
      },
    });
  }

  return jobs;
}

/** 홈/블로그 목록 등 정적 페이지용 작업. */
function staticJobs(): OgJob[] {
  return [
    {
      outRelative: "home.png",
      template: {
        title: "쉽고 가볍게 사용하는 오픈소스 디자인 시스템",
      },
    },
    {
      outRelative: "blog.png",
      template: {
        title: "Dale UI 블로그",
        eyebrow: "블로그",
      },
    },
  ];
}

async function main(): Promise<void> {
  const [fonts, logoDataUri, backgroundDataUri] = await Promise.all([
    loadFonts(),
    loadLogoDataUri(),
    loadBackgroundDataUri(),
  ]);

  await mkdir(BLOG_OUT_DIR, { recursive: true });

  // 모든 작업에 동일한 브랜드 로고·배경을 주입. 해시 입력에 포함되므로 로고나
  // 배경이 바뀌면 캐시가 자연히 무효화됩니다.
  const jobs = [...staticJobs(), ...(await collectBlogJobs())].map((job) => ({
    ...job,
    template: { ...job.template, logoDataUri, backgroundDataUri },
  }));

  // 이전 매니페스트(캐시) 로드.
  let prevManifest: Record<string, string> = {};
  if (existsSync(MANIFEST_PATH)) {
    try {
      prevManifest = JSON.parse(
        await readFile(MANIFEST_PATH, "utf8"),
      ) as Record<string, string>;
    } catch {
      prevManifest = {};
    }
  }

  const nextManifest: Record<string, string> = {};
  const validBlogFiles = new Set<string>();
  let generated = 0;
  let skipped = 0;

  for (const job of jobs) {
    const hash = hashJob(job.template);
    nextManifest[job.outRelative] = hash;
    if (job.outRelative.startsWith("blog/")) {
      validBlogFiles.add(job.outRelative.slice("blog/".length));
    }

    const outPath = join(OUT_DIR, job.outRelative);
    if (prevManifest[job.outRelative] === hash && existsSync(outPath)) {
      skipped++;
      continue;
    }

    const png = await renderPng(createOgTemplate(job.template), fonts);
    await writeFile(outPath, png);
    generated++;
  }

  // 더 이상 글이 없어 매니페스트에서 빠진 블로그 PNG 정리(stale 무효화).
  const existingBlog = existsSync(BLOG_OUT_DIR)
    ? await readdir(BLOG_OUT_DIR)
    : [];
  await Promise.all(
    existingBlog
      .filter((file) => file.endsWith(".png") && !validBlogFiles.has(file))
      .map((file) => rm(join(BLOG_OUT_DIR, file))),
  );

  await writeFile(MANIFEST_PATH, `${JSON.stringify(nextManifest, null, 2)}\n`);

  console.log(
    `[generate-og] OG 이미지 ${generated}개 생성, ${skipped}개 캐시 재사용 (총 ${jobs.length}개).`,
  );
}

main().catch((err) => {
  console.error("[generate-og] 실패:", err);
  process.exit(1);
});
