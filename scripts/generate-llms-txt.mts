/**
 * 사이트용 llms 파일 생성기.
 *
 * - public/llms.txt: 목차
 * - public/llms-full.txt: 실제 MDX가 있는 문서 전체
 * - public/llms-foundations.txt: 파운데이션
 * - public/llms-components.txt: 컴포넌트 MDX가 있을 때만 생성하고 목차에 링크
 *
 * 플레이스홀더 문서는 제외합니다. predev/prebuild에서 실행합니다.
 */
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DOCS_NAV } from "../src/sections/docs/docsNav.ts";
import { expandComponents } from "./expand-mdx-components.mts";

const ROOT = join(import.meta.dirname, "..");
const DOCS_DIR = join(ROOT, "src", "content", "docs");
const PUBLIC_DIR = join(ROOT, "public");
const SITE_URL = "https://www.daleui.com";
const STORYBOOK_URL = "https://main--675790d317ba346348aa3490.chromatic.com";
const GITHUB_URL = "https://github.com/DaleStudy/daleui";
const SPONSOR_URL = "https://github.com/sponsors/DaleStudy";
const FIGMA_URL = "https://www.figma.com/community/file/1559487636467651573";

const BLURB =
  "한국어 우선 React 디자인 시스템. Panda CSS 시맨틱 토큰과 접근성 높은 컴포넌트를 제공합니다.";

interface TopicSet {
  category: string;
  filename: string;
  label: string;
  description: string;
}

const TOPIC_SETS: TopicSet[] = [
  {
    category: "파운데이션",
    filename: "llms-foundations.txt",
    label: "Foundations",
    description: "색상, 타이포그래피, 스페이싱, 보더, 모서리 반경, 아이콘",
  },
  {
    category: "컴포넌트",
    filename: "llms-components.txt",
    label: "Components",
    description: "레이아웃, 타이포그래피, 폼, 일반 컴포넌트",
  },
];

interface DocPage {
  category: string;
  group?: string;
  id: string;
  title: string;
  body: string;
}

function demoteHeadings(markdown: string, by: number): string {
  return markdown.replace(/^(#{1,6})[ \t]+/gm, (_, hashes: string) => {
    const level = Math.min(6, hashes.length + by);
    return `${"#".repeat(level)} `;
  });
}

function toAbsoluteLinks(markdown: string): string {
  return markdown.replace(/\]\(\//g, `](${SITE_URL}/`);
}

function renderPage(page: DocPage): string {
  const body = toAbsoluteLinks(
    demoteHeadings(expandComponents(page.body).trim(), 2),
  );
  const group = page.group ? `${page.group} · ` : "";
  return [
    `### ${group}${page.title}`,
    "",
    `${SITE_URL}/docs/${page.id}`,
    "",
    body,
    "",
  ].join("\n");
}

function renderDocument(title: string, pages: DocPage[]): string {
  const sections: string[] = [`# ${title}`, "", `> ${BLURB}`, ""];
  let category = "";

  for (const page of pages) {
    if (page.category !== category) {
      category = page.category;
      sections.push(`## ${category}`, "");
    }
    sections.push(renderPage(page));
  }

  return `${sections.join("\n").trim()}\n`;
}

function renderIndex(sets: TopicSet[], pages: DocPage[]): string {
  const setLinks = [
    `- [Complete documentation](${SITE_URL}/llms-full.txt): 사이트에 공개된 문서 전체`,
    ...sets.map(
      (set) =>
        `- [${set.label}](${SITE_URL}/${set.filename}): ${set.description}`,
    ),
  ];

  const docSections: string[] = [];
  let category = "";
  for (const page of pages) {
    if (page.category !== category) {
      category = page.category;
      if (docSections.length > 0) docSections.push("");
      docSections.push(`### ${category}`, "");
    }
    const label = page.group ? `${page.group} · ${page.title}` : page.title;
    docSections.push(`- [${label}](${SITE_URL}/docs/${page.id}.md)`);
  }

  return [
    "# daleui",
    "",
    `> ${BLURB}`,
    "",
    "## 사이트",
    "",
    `- [홈](${SITE_URL}): 달레UI 소개`,
    `- [문서](${SITE_URL}/docs): 사람용 문서`,
    `- [모범사례](${SITE_URL}/showcase): DaleUI로 만든 프로젝트`,
    `- [블로그](${SITE_URL}/blog): 디자인 시스템을 만들며 쌓은 기록`,
    `- [후원하기](${SPONSOR_URL})`,
    "",
    "## Documentation Sets",
    "",
    ...setLinks,
    "",
    "## Docs",
    "",
    ...docSections,
    "",
    "## Notes",
    "",
    "- 문서 상세 본문은 Documentation Sets의 파일에 있습니다.",
    "- 패키지 설치: `daleui pretendard @fontsource-variable/jetbrains-mono`",
    "",
    "## Optional",
    "",
    `- [Storybook (Chromatic)](${STORYBOOK_URL}): 사람용 시각 문서`,
    `- [GitHub](${GITHUB_URL})`,
    `- [Figma UI 킷](${FIGMA_URL})`,
    "",
  ].join("\n");
}

async function listDocsMdxIds(): Promise<Set<string>> {
  if (!existsSync(DOCS_DIR)) return new Set();
  const entries = await readdir(DOCS_DIR);
  return new Set(
    entries
      .filter((name) => name.endsWith(".mdx"))
      .map((name) => name.replace(/\.mdx$/, "")),
  );
}

async function collectPages(mdxIds: Set<string>): Promise<DocPage[]> {
  const pages: DocPage[] = [];

  for (const category of DOCS_NAV) {
    for (const group of category.groups) {
      for (const item of group.items) {
        if (!mdxIds.has(item.id)) continue;
        const raw = await readFile(join(DOCS_DIR, `${item.id}.mdx`), "utf8");
        pages.push({
          category: category.title,
          group: group.label,
          id: item.id,
          title: item.title,
          body: raw.replace(/^---\n[\s\S]*?\n---\n*/, ""),
        });
      }
    }
  }

  return pages;
}

async function writePublic(filename: string, content: string): Promise<void> {
  await writeFile(join(PUBLIC_DIR, filename), content);
}

async function removePublic(filename: string): Promise<void> {
  const path = join(PUBLIC_DIR, filename);
  if (existsSync(path)) await unlink(path);
}

async function main(): Promise<void> {
  const pages = await collectPages(await listDocsMdxIds());
  const publishedSets = TOPIC_SETS.filter((set) =>
    pages.some((page) => page.category === set.category),
  );

  await mkdir(PUBLIC_DIR, { recursive: true });
  await writePublic("llms.txt", renderIndex(publishedSets, pages));
  await writePublic("llms-full.txt", renderDocument("daleui", pages));

  for (const set of TOPIC_SETS) {
    const topicPages = pages.filter((page) => page.category === set.category);
    if (topicPages.length === 0) {
      await removePublic(set.filename);
      continue;
    }
    await writePublic(
      set.filename,
      renderDocument(`daleui ${set.label}`, topicPages),
    );
  }

  const written = [
    "llms.txt",
    "llms-full.txt",
    ...publishedSets.map((set) => set.filename),
  ];
  console.log(
    `[generate-llms] ${written.join(", ")} 생성 완료 (문서 ${pages.length}개)`,
  );
}

main().catch((err) => {
  console.error("[generate-llms] 실패:", err);
  process.exit(1);
});
