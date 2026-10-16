/**
 * 문서 MDX의 표·아이콘 목록·코드 탭을 마크다운으로 바꿉니다.
 * llms 파일과 페이지별 Markdown이 같은 변환을 씁니다.
 */
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

function markdownTable(headers: string[], rows: string[][]): string {
  const cell = (value: string) =>
    value.replace(/\|/g, "\\|").replace(/\n/g, " ");
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
      return ["solid", "dashed", "dotted"]
        .map((style) => `- \`${style}\``)
        .join("\n");
    case "IconGallery":
      return listIconNames(kind ?? "")
        .map((iconName) => `- \`${iconName}\``)
        .join("\n");
    default:
      console.warn(`[expand-mdx] 알 수 없는 MDX 컴포넌트: ${name}`);
      return "";
  }
}

/**
 * CodeTabs/CodeTab 짝 태그를 걷어내고, 탭 label을 소제목으로 남긴다.
 * (self-closing JSX와 달리 여닫는 형태라 별도 처리.
 *  탭 안에 코드 펜스가 있으므로 펜스 분할보다 먼저 호출해야 한다.)
 */
function expandCodeTabs(markdown: string): string {
  return markdown.replace(
    /<CodeTabs>\s*([\s\S]*?)<\/CodeTabs>/g,
    (_, inner: string) => {
      const tabs: string[] = [];
      for (const match of inner.matchAll(
        /<CodeTab\s+label="([^"]*)"[^>]*>\s*([\s\S]*?)\s*<\/CodeTab>/g,
      )) {
        const label = match[1] ?? "";
        const content = (match[2] ?? "").trim();
        tabs.push(`### ${label}\n\n${content}`);
      }
      return tabs.join("\n\n");
    },
  );
}

/** 코드 펜스와 인라인 코드 밖의 JSX 컴포넌트를 마크다운으로 바꿉니다. */
export function expandComponents(markdown: string): string {
  // CodeTabs는 내부에 ``` 펜스를 포함하므로 펜스 분할 전에 펼친다.
  const withTabs = expandCodeTabs(markdown);
  const fences = withTabs.split(/(```[\s\S]*?```)/g);
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
