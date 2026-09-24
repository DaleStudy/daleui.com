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
import { listIconNames } from "../src/sections/docs/foundations/iconNames.ts";
import {
  borderWidthTokens,
  describeTextStyle,
  findSemanticColorGroup,
  flattenTokens,
  listBorders,
  listPalettes,
  listTextStylesIn,
  pxLabel,
} from "../src/sections/docs/foundations/tokenValues.ts";
import { radii } from "../src/tokens/radii.ts";
import { spacing } from "../src/tokens/spacing.ts";
import {
  fontSizes,
  fontWeights,
  fonts,
  letterSpacings,
  lineHeights,
} from "../src/tokens/typography.ts";

const ROOT = join(import.meta.dirname, "..");
const DOCS_DIR = join(ROOT, "src", "content", "docs");
const PUBLIC_DIR = join(ROOT, "public");
const SITE_URL = "https://www.daleui.com";
const STORYBOOK_URL =
  "https://main--675790d317ba346348aa3490.chromatic.com";
const GITHUB_URL = "https://github.com/DaleStudy/daleui";
const SPONSOR_URL = "https://github.com/sponsors/DaleStudy";
const FIGMA_URL =
  "https://www.figma.com/community/file/1559487636467651573";

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

function markdownTable(headers: string[], rows: string[][]): string {
  const cell = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");
  const line = (values: string[]) => `| ${values.map(cell).join(" | ")} |`;
  return [
    line(headers),
    line(headers.map(() => "---")),
    ...rows.map((row) => line(row)),
  ].join("\n");
}

function attr(attrs: string, name: string): string | undefined {
  return attrs.match(new RegExp(`${name}=["']([^"']+)["']`))?.[1];
}

function renderJsx(name: string, attrs: string): string {
  const group = attr(attrs, "group");
  const kind = attr(attrs, "kind");

  switch (name) {
    case "SpacingTable":
      return markdownTable(
        ["토큰", "rem", "px"],
        flattenTokens(spacing).map((row) => [
          row.name,
          row.value,
          pxLabel(row.value),
        ]),
      );
    case "RadiusTable":
      return markdownTable(
        ["토큰", "값", "px"],
        flattenTokens(radii).map((row) => [
          row.name,
          row.value,
          pxLabel(row.value),
        ]),
      );
    case "FontTable":
      return markdownTable(
        ["토큰", "값"],
        flattenTokens(fonts).map((row) => [row.name, row.value]),
      );
    case "FontSizeTable":
      return markdownTable(
        ["토큰", "rem", "px"],
        flattenTokens(fontSizes).map((row) => [
          row.name,
          row.value,
          pxLabel(row.value),
        ]),
      );
    case "FontWeightTable":
      return markdownTable(
        ["토큰", "값"],
        flattenTokens(fontWeights).map((row) => [row.name, row.value]),
      );
    case "LineHeightTable":
      return markdownTable(
        ["토큰", "값"],
        flattenTokens(lineHeights).map((row) => [row.name, row.value]),
      );
    case "LetterSpacingTable":
      return markdownTable(
        ["토큰", "값"],
        flattenTokens(letterSpacings).map((row) => [row.name, row.value]),
      );
    case "TextStyleSamples":
      return markdownTable(
        ["토큰", "구성"],
        listTextStylesIn(group ?? "").map((row) => [
          row.name,
          describeTextStyle(row.value),
        ]),
      );
    case "SemanticColorTable":
      return markdownTable(
        ["토큰", "라이트", "다크"],
        findSemanticColorGroup(group ?? "").rows.map((row) => [
          row.name,
          `${row.lightRef} (${row.lightValue})`,
          `${row.darkRef} (${row.darkValue})`,
        ]),
      );
    case "PaletteGrid":
      return listPalettes()
        .map((palette) => {
          const pair = palette.counterpart
            ? `\n\n${palette.isDark ? "라이트" : "다크"} 짝: \`${palette.counterpart}\``
            : "";
          return [
            `#### ${palette.name}${pair}`,
            "",
            markdownTable(
              ["단계", "값"],
              palette.shades.map((shade) => [shade.name, shade.value]),
            ),
          ].join("\n");
        })
        .join("\n\n");
    case "BorderWidthTable":
      return markdownTable(
        ["토큰", "값"],
        borderWidthTokens.map((row) => [row.name, row.value]),
      );
    case "BorderTable":
      return markdownTable(
        ["토큰", "두께", "스타일", "색상"],
        listBorders().map((row) => [
          row.name,
          row.width,
          row.style,
          row.colorRef,
        ]),
      );
    case "BorderStyleSample":
      return ["solid", "dashed", "dotted"].map((style) => `- \`${style}\``).join("\n");
    case "IconGallery":
      return listIconNames(kind ?? "")
        .map((iconName) => `- \`${iconName}\``)
        .join("\n");
    default:
      console.warn(`[generate-llms] 알 수 없는 MDX 컴포넌트: ${name}`);
      return "";
  }
}

/** 코드 펜스와 인라인 코드 밖의 JSX 컴포넌트를 마크다운 표로 바꿉니다. */
function expandComponents(markdown: string): string {
  const fences = markdown.split(/(```[\s\S]*?```)/g);
  return fences
    .map((part) => {
      if (part.startsWith("```")) return part;

      const codes: string[] = [];
      const masked = part.replace(/`[^`\n]+`/g, (code) => {
        codes.push(code);
        return `\0CODE${codes.length - 1}\0`;
      });
      const expanded = masked.replace(
        /<([A-Z][A-Za-z0-9]*)([^>]*?)\/>/g,
        (_, name: string, attrs: string) => renderJsx(name, attrs),
      );
      return expanded.replace(
        /\0CODE(\d+)\0/g,
        (_, index: string) => codes[Number(index)] ?? "",
      );
    })
    .join("");
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

function renderIndex(sets: TopicSet[]): string {
  const setLinks = [
    `- [Complete documentation](${SITE_URL}/llms-full.txt): 사이트에 공개된 문서 전체`,
    ...sets.map(
      (set) =>
        `- [${set.label}](${SITE_URL}/${set.filename}): ${set.description}`,
    ),
  ];

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
  await writePublic("llms.txt", renderIndex(publishedSets));
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
