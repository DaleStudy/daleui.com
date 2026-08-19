import { css, sva } from "../../../../styled-system/css";
import { TokenName, TokenTable, TokenValue } from "./TokenTable";
import { borderWidthTokens, listBorders, tokenVar } from "./tokenValues";

const LINE_STYLES = ["solid", "dashed", "dotted"] as const;

/** 테두리 두께 단계 */
export function BorderWidthTable() {
  return (
    <TokenTable
      caption="보더 두께 토큰 목록"
      columns={["토큰", "값", "미리보기"]}
      rows={borderWidthTokens.map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="value">{row.value}</TokenValue>,
          <span
            key="sample"
            aria-hidden
            className={widthSample}
            style={{ borderTopWidth: row.value }}
          />,
        ],
      }))}
    />
  );
}

/** 두께·스타일·색상을 한 벌로 묶은 보더 토큰 */
export function BorderTable() {
  return (
    <TokenTable
      caption="보더 토큰 목록"
      columns={["토큰", "두께", "스타일", "색상", "미리보기"]}
      rows={listBorders().map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="width">{row.width}</TokenValue>,
          <TokenValue key="style">{row.style}</TokenValue>,
          <TokenValue key="color">
            {row.colorRef.replace(/^colors\./, "")}
          </TokenValue>,
          <span
            key="sample"
            aria-hidden
            className={borderSample}
            style={{ border: tokenVar(`borders.${row.name}`) }}
          />,
        ],
      }))}
    />
  );
}

/** 토큰으로 관리하지 않는 선 모양 비교 */
export function BorderStyleSample() {
  const styles = borderStyleSample();

  return (
    <div className={styles.grid}>
      {LINE_STYLES.map((style) => (
        <div key={style} className={styles.card}>
          <span
            aria-hidden
            className={styles.sample}
            style={{ borderStyle: style }}
          />
          <span className={styles.label}>
            <TokenName>{style}</TokenName>
          </span>
        </div>
      ))}
    </div>
  );
}

const widthSample = css({
  display: "block",
  width: "80px",
  borderTopStyle: "solid",
  borderColor: "border.neutral",
});

const borderSample = css({
  display: "block",
  width: "64px",
  height: "32px",
  borderRadius: "sm",
});

const borderStyleSample = sva({
  slots: ["grid", "card", "sample", "label"],
  base: {
    grid: {
      display: "grid",
      gridTemplateColumns: { base: "1fr", sm: "repeat(3, 1fr)" },
      gap: "16",
    },
    card: {
      display: "flex",
      flexDirection: "column",
      gap: "12",
      alignItems: "flex-start",
    },
    sample: {
      display: "block",
      width: "100%",
      height: "48px",
      borderRadius: "sm",
      borderWidth: "1px",
      borderColor: "border.neutral",
    },
    label: { textStyle: "body.sm" },
  },
});
