/**
 * GitHub Discussions의 "블로그" 카테고리 글을 가져와 src/content/blog/ 아래
 * Markdown 파일로 생성합니다. 빌드/개발 시작 전(predev, prebuild)에 실행됩니다.
 *
 * public 저장소이므로 인증 없이 동작합니다. GITHUB_TOKEN이 있으면 rate limit만
 * 상향됩니다(CI에서 권장). 네트워크 실패 시 경고만 남기고 종료해 기존 mdx로 빌드합니다.
 */
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OWNER = "DaleStudy";
const REPO = "daleui";
const CATEGORY = "블로그";
const OUT_DIR = join(import.meta.dirname, "..", "src", "content", "blog");

/**
 * 생성 파일명은 `<discussion 번호>.md`이며 slug = 번호 (예: /blog/987).
 * GFM 본문은 .md(순수 markdown)로 저장해 MDX 파싱 충돌을 피합니다.
 */
const GENERATED_NAME = /^\d+\.md$/;

interface Discussion {
  number: number;
  title: string;
  body: string;
  created_at: string;
  user: { login: string } | null;
  category: { name: string } | null;
}

async function fetchDiscussions(): Promise<Discussion[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const result: Discussion[] = [];

  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/discussions?per_page=100&page=${page}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    }

    const page_items = (await res.json()) as Discussion[];
    if (page_items.length === 0) break;

    for (const item of page_items) {
      if (item.category?.name === CATEGORY) {
        result.push(item);
      }
    }

    if (page_items.length < 100) break;
  }

  return result;
}

/** YAML frontmatter 값에 들어갈 문자열을 안전하게 인용합니다. */
function quote(value: string): string {
  return JSON.stringify(value);
}

/** 본문 첫 문단에서 description을 추출합니다 (마크다운 기호 제거, 160자 제한). */
function deriveDescription(body: string): string {
  const firstParagraph = body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find(
      (block) => block && !block.startsWith("#") && !block.startsWith("```"),
    );
  if (!firstParagraph) return "";
  const plain = firstParagraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // 링크 → 텍스트
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 159)}…` : plain;
}

function toMarkdown(d: Discussion): string {
  const date = d.created_at.slice(0, 10); // YYYY-MM-DD
  const author = d.user?.login ?? "DaleStudy";
  const description = deriveDescription(d.body);

  const frontmatter = [
    "---",
    `title: ${quote(d.title)}`,
    description ? `description: ${quote(description)}` : null,
    `date: ${date}`,
    `author: ${quote(author)}`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  return `${frontmatter}\n\n${d.body.trim()}\n`;
}

async function cleanGenerated(): Promise<void> {
  const entries = await readdir(OUT_DIR);
  await Promise.all(
    entries
      .filter((name) => GENERATED_NAME.test(name))
      .map((name) => unlink(join(OUT_DIR, name))),
  );
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });

  let discussions: Discussion[];
  try {
    discussions = await fetchDiscussions();
  } catch (err) {
    console.warn(
      `[sync-blog] Discussions를 가져오지 못해 동기화를 건너뜁니다 (기존 mdx로 빌드): ${String(err)}`,
    );
    return;
  }

  await cleanGenerated();
  await Promise.all(
    discussions.map((d) =>
      writeFile(join(OUT_DIR, `${d.number}.md`), toMarkdown(d)),
    ),
  );

  console.log(
    `[sync-blog] "${CATEGORY}" 카테고리 글 ${discussions.length}개 동기화 완료.`,
  );
}

main().catch((err) => {
  console.error("[sync-blog] 실패:", err);
  process.exit(1);
});
