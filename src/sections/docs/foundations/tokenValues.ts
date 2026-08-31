import type { CSSProperties } from "react";
import { type Token, token } from "../../../../styled-system/tokens";
import { borderWidths, borders } from "../../../tokens/borders";
import { colors, semanticColors } from "../../../tokens/colors";
import { textStyles } from "../../../tokens/typography";

const TOKEN_REF = /^\{(.+)\}$/;

const REM = /^(-?[\d.]+)rem$/;

/** 토큰 정의는 `Recursive<Token>` 이라 좁히기 전까지 임의 깊이의 객체로 다룹니다. */
type TokenNode = Record<string, unknown>;

function isRecord(value: unknown): value is TokenNode {
  return typeof value === "object" && value !== null;
}

function isLeaf(value: unknown): value is { value: unknown } {
  return isRecord(value) && "value" in value;
}

/**
 * `{colors.violet.3}` 형태의 토큰 참조를 실제 값으로 바꿉니다.
 * 참조가 아니거나 알 수 없는 경로면 입력을 그대로 돌려줍니다.
 */
export function resolveTokenRef(ref: string): string {
  const path = TOKEN_REF.exec(ref)?.[1];
  return path ? token(path as Token, ref) : ref;
}

/**
 * 토큰 경로를 CSS 변수 참조로 바꿉니다.
 * 시맨틱 토큰은 변수로 참조해야 테마 전환이 그대로 따라옵니다.
 */
export function tokenVar(path: string): string {
  return token.var(path as Token, "");
}

/** rem 값을 브라우저 기본 크기(16px) 기준 픽셀 문자열로 바꿉니다. rem이 아니면 null입니다. */
export function remToPx(value: string): string | null {
  const rem = REM.exec(value)?.[1];
  return rem ? `${Number(rem) * 16}px` : null;
}

/** 표의 px 칸에 넣을 문자열입니다. rem이 아닌 값은 환산하지 않고 `-`로 둡니다. */
export function pxLabel(value: string): string {
  return remToPx(value) ?? "-";
}

/** 점으로 이은 경로와 문자열 값을 가진 평탄화된 토큰 */
export interface FlatToken {
  /** 예: `label.md.underline` */
  name: string;
  value: string;
}

/**
 * 중첩된 토큰 정의의 잎을 `이름 → 값`으로 훑습니다.
 * `DEFAULT` 키는 경로에서 빠져, `bg.brand.DEFAULT`는 `bg.brand`가 됩니다.
 */
function walkLeaves(
  group: unknown,
  visit: (name: string, value: unknown) => void,
) {
  const walk = (node: TokenNode, path: string[]) => {
    for (const [key, child] of Object.entries(node)) {
      const next = key === "DEFAULT" ? path : [...path, key];
      if (isLeaf(child)) {
        visit(next.join("."), child.value);
      } else if (isRecord(child)) {
        walk(child, next);
      }
    }
  };

  if (isRecord(group)) {
    walk(group, []);
  }
}

/** 중첩된 토큰 정의를 `이름 → 값` 목록으로 평탄화합니다. 문자열이 아닌 값은 건너뜁니다. */
export function flattenTokens(group: unknown): FlatToken[] {
  const flat: FlatToken[] = [];

  walkLeaves(group, (name, value) => {
    if (typeof value === "string") {
      flat.push({ name, value });
    }
  });

  return flat;
}

/** 라이트·다크 값을 함께 가지는 시맨틱 색상 토큰 */
export interface SemanticColorRow {
  /** 예: `bg.brand.hover` */
  name: string;
  /** 라이트 테마가 참조하는 프리미티브 토큰 경로. 예: `colors.violet.3` */
  lightRef: string;
  /** 다크 테마가 참조하는 프리미티브 토큰 경로 */
  darkRef: string;
  /** 라이트 테마에서 실제로 적용되는 색상 값 */
  lightValue: string;
  /** 다크 테마에서 실제로 적용되는 색상 값 */
  darkValue: string;
}

/** 최상위 이름(`bg`, `fg` 등)으로 묶은 시맨틱 색상 토큰 */
export interface SemanticColorGroup {
  name: string;
  rows: SemanticColorRow[];
}

function stripBraces(ref: string): string {
  return TOKEN_REF.exec(ref)?.[1] ?? ref;
}

function toSemanticRow(name: string, value: unknown): SemanticColorRow {
  const { base: light, _dark: dark } = value as { base: string; _dark: string };

  return {
    name,
    lightRef: stripBraces(light),
    darkRef: stripBraces(dark),
    lightValue: resolveTokenRef(light),
    darkValue: resolveTokenRef(dark),
  };
}

/** 시맨틱 색상 토큰을 최상위 이름별로 묶어 반환합니다. */
export function listSemanticColorGroups(): SemanticColorGroup[] {
  return Object.entries(semanticColors as TokenNode).map(([name, group]) => {
    if (isLeaf(group)) {
      return { name, rows: [toSemanticRow(name, group.value)] };
    }

    const rows: SemanticColorRow[] = [];
    walkLeaves(group, (path, value) => {
      rows.push(toSemanticRow([name, path].filter(Boolean).join("."), value));
    });

    return { name, rows };
  });
}

/** 이름으로 시맨틱 색상 묶음 하나를 찾습니다. 없는 이름이면 실패합니다. */
export function findSemanticColorGroup(name: string): SemanticColorGroup {
  const group = listSemanticColorGroups().find((item) => item.name === name);
  if (!group) {
    throw new Error(`${name} 시맨틱 색상 묶음이 없습니다`);
  }

  return group;
}

/** 하나의 색상 팔레트와 그 단계들 */
export interface Palette {
  /** 예: `violet` */
  name: string;
  /** 다크 테마용 팔레트 여부 */
  isDark: boolean;
  /** 같은 색조의 반대 테마 팔레트 이름. 없으면 undefined */
  counterpart?: string;
  shades: FlatToken[];
}

/** `dark`로 시작하는 팔레트는 다크 테마용으로 보고 라이트 팔레트와 짝지어 줍니다. */
export function listPalettes(): Palette[] {
  const names = Object.keys(colors as TokenNode);

  return names.map((name) => {
    const isDark = name.startsWith("dark");
    const hue = isDark ? name.slice(4) : name;
    const counterpart = isDark
      ? names.find((other) => other === hue[0].toLowerCase() + hue.slice(1))
      : names.find(
          (other) => other === `dark${name[0].toUpperCase()}${name.slice(1)}`,
        );

    return {
      name,
      isDark,
      counterpart,
      shades: flattenTokens({ [name]: (colors as TokenNode)[name] }).map(
        (shade) => ({
          ...shade,
          name: shade.name.slice(name.length + 1),
        }),
      ),
    };
  });
}

/** 두께·스타일·색상을 합친 보더 토큰 */
export interface BorderRow {
  /** 예: `neutral` */
  name: string;
  /** 참조하는 두께 토큰 경로. 예: `borderWidths.sm` */
  widthRef: string;
  width: string;
  style: string;
  /** 참조하는 색상 토큰 경로. 예: `colors.border.neutral` */
  colorRef: string;
}

/** 보더 토큰을 표에 쓸 수 있는 형태로 펼칩니다. 합성 값이 아닌 항목은 건너뜁니다. */
export function flattenBorders(group: unknown): BorderRow[] {
  return Object.entries(group as TokenNode).flatMap(([name, border]) => {
    if (!isLeaf(border) || !isRecord(border.value)) {
      return [];
    }

    const { width, style, color } = border.value;
    const widthRef = typeof width === "string" ? width : "";
    const colorRef = typeof color === "string" ? color : "";

    return [
      {
        name,
        widthRef: stripBraces(widthRef),
        width: resolveTokenRef(widthRef),
        style: typeof style === "string" ? style : "",
        colorRef: stripBraces(colorRef),
      },
    ];
  });
}

/** 보더 토큰 목록 */
export function listBorders(): BorderRow[] {
  return flattenBorders(borders);
}

/** 보더 두께 토큰 목록 */
export const borderWidthTokens = flattenTokens(borderWidths);

/** textStyle 하나의 정의 값 */
export interface TextStyleValue {
  fontFamily?: string;
  /** 반응형 정의일 수 있어 브레이크포인트별 객체도 허용합니다. */
  fontSize?: string | Record<string, string>;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textDecoration?: string;
}

/** 평탄화된 textStyle */
export interface TextStyleRow {
  /** 예: `label.md.underline` */
  name: string;
  value: TextStyleValue;
}

/** 중첩된 textStyles 정의를 `이름 → 값` 목록으로 평탄화합니다. */
export function flattenTextStyles(): TextStyleRow[] {
  const rows: TextStyleRow[] = [];

  walkLeaves(textStyles, (name, value) => {
    rows.push({ name, value: value as TextStyleValue });
  });

  return rows;
}

/** 한 묶음(`body`, `label` 등)에 속한 textStyle 목록입니다. 비어 있으면 실패합니다. */
export function listTextStylesIn(group: string): TextStyleRow[] {
  const rows = flattenTextStyles().filter(
    (row) => row.name === group || row.name.startsWith(`${group}.`),
  );
  if (rows.length === 0) {
    throw new Error(`${group} 텍스트 스타일이 없습니다`);
  }

  return rows;
}

/** fontSize 정의를 기준값과 브레이크포인트별 값으로 나눕니다. */
export function describeFontSize(fontSize: TextStyleValue["fontSize"]): {
  base: string;
  responsive: FlatToken[];
} {
  if (!fontSize) {
    return { base: "", responsive: [] };
  }
  if (typeof fontSize === "string") {
    return { base: fontSize, responsive: [] };
  }

  const { base = "", ...breakpoints } = fontSize;
  return {
    base,
    responsive: Object.entries(breakpoints).map(([name, value]) => ({
      name,
      value,
    })),
  };
}

/** textStyle 구성을 한 줄 설명으로 만듭니다. 정의되지 않은 항목은 `-`로 둡니다. */
export function describeTextStyle(value: TextStyleValue): string {
  const { base, responsive } = describeFontSize(value.fontSize);

  return [
    `크기 ${base}`,
    ...responsive.map((item) => `${item.name} 이상 ${item.value}`),
    `굵기 ${value.fontWeight ?? "-"}`,
    `행간 ${value.lineHeight ?? "-"}`,
    `자간 ${value.letterSpacing ?? "-"}`,
  ].join(" · ");
}

/**
 * textStyle 정의를 미리보기용 인라인 스타일로 바꿉니다.
 * 동적인 토큰 이름은 Panda가 정적으로 추출할 수 없어 값을 직접 넣습니다.
 * 반응형 fontSize는 기준값만 사용합니다.
 */
export function textStyleToCss(value: TextStyleValue): CSSProperties {
  const fontSize = describeFontSize(value.fontSize).base;
  const fontWeight = value.fontWeight
    ? token(`fontWeights.${value.fontWeight}` as Token)
    : undefined;

  return {
    fontFamily: value.fontFamily
      ? token(`fonts.${value.fontFamily}` as Token)
      : undefined,
    fontSize: fontSize ? token(`fontSizes.${fontSize}` as Token) : undefined,
    fontWeight: fontWeight ? Number(fontWeight) : undefined,
    lineHeight: value.lineHeight
      ? token(`lineHeights.${value.lineHeight}` as Token)
      : undefined,
    letterSpacing: value.letterSpacing
      ? token(`letterSpacings.${value.letterSpacing}` as Token)
      : undefined,
    textDecoration: value.textDecoration,
  };
}
