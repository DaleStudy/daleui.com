import { css, sva } from "../../../../styled-system/css";
import { TokenName, TokenTable, TokenValue } from "./TokenTable";
import {
  describeTextStyle,
  flattenTokens,
  listTextStylesIn,
  pxLabel,
  textStyleToCss,
} from "./tokenValues";
import {
  fontSizes,
  fontWeights,
  fonts,
  letterSpacings,
  lineHeights,
} from "../../../tokens/typography";

const SAMPLE = "다람쥐 헌 쳇바퀴에 타고파 Sphinx of black quartz 0123";

/** 서체 토큰과 실제 렌더링 모습 */
export function FontTable() {
  return (
    <TokenTable
      caption="폰트 토큰 목록"
      columns={["토큰", "값", "미리보기"]}
      rows={flattenTokens(fonts).map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="value">{row.value}</TokenValue>,
          <span key="sample" style={{ fontFamily: row.value }}>
            {SAMPLE}
          </span>,
        ],
      }))}
    />
  );
}

/** 글자 크기 단계와 px 환산값 */
export function FontSizeTable() {
  return (
    <TokenTable
      caption="폰트 사이즈 토큰 목록"
      columns={["토큰", "rem", "px", "미리보기"]}
      rows={flattenTokens(fontSizes).map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="rem">{row.value}</TokenValue>,
          <TokenValue key="px">{pxLabel(row.value)}</TokenValue>,
          <span key="sample" style={{ fontSize: row.value }}>
            가나다 Aa
          </span>,
        ],
      }))}
    />
  );
}

/** 글자 굵기 단계 */
export function FontWeightTable() {
  return (
    <TokenTable
      caption="폰트 굵기 토큰 목록"
      columns={["토큰", "값", "미리보기"]}
      rows={flattenTokens(fontWeights).map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="value">{row.value}</TokenValue>,
          <span key="sample" style={{ fontWeight: Number(row.value) }}>
            {SAMPLE}
          </span>,
        ],
      }))}
    />
  );
}

/** 행간 단계와 여러 줄 미리보기 */
export function LineHeightTable() {
  return (
    <TokenTable
      caption="행간 토큰 목록"
      columns={["토큰", "값", "미리보기"]}
      rows={flattenTokens(lineHeights).map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="value">{row.value}</TokenValue>,
          <span
            key="sample"
            className={lineSample}
            style={{ lineHeight: row.value }}
          >
            {SAMPLE} {SAMPLE}
          </span>,
        ],
      }))}
    />
  );
}

/** 자간 단계 */
export function LetterSpacingTable() {
  return (
    <TokenTable
      caption="자간 토큰 목록"
      columns={["토큰", "값"]}
      rows={flattenTokens(letterSpacings).map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="value">{row.value}</TokenValue>,
        ],
      }))}
    />
  );
}

/**
 * 한 묶음(`body`, `label` 등)에 속한 텍스트 스타일의 구성과 미리보기.
 * Panda가 동적 textStyle을 정적으로 추출할 수 없어 토큰 값을 인라인 스타일로 풉니다.
 */
export function TextStyleSamples({ group }: { group: string }) {
  const rows = listTextStylesIn(group);
  const styles = textStyleSamples();

  return (
    <>
      {rows.map((row) => (
        <div key={row.name} className={styles.card}>
          <div className={styles.meta}>
            <TokenName>{row.name}</TokenName>
            <span className={styles.hint}>{describeTextStyle(row.value)}</span>
          </div>
          <p className={styles.sample} style={textStyleToCss(row.value)}>
            {SAMPLE}
          </p>
        </div>
      ))}
    </>
  );
}

const lineSample = css({
  display: "block",
  maxWidth: "320px",
  textStyle: "body.sm",
});

const textStyleSamples = sva({
  slots: ["card", "meta", "hint", "sample"],
  base: {
    card: {
      mt: "16",
      p: "16",
      borderRadius: "md",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.neutral",
      overflowX: "auto",
    },
    meta: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "8",
      mb: "12",
    },
    hint: {
      textStyle: "caption",
      color: "fg.neutral.placeholder",
    },
    sample: {
      color: "fg.neutral.active",
      wordBreak: "keep-all",
    },
  },
});
