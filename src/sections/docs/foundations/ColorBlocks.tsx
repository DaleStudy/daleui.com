import { sva } from "../../../../styled-system/css";
import { TokenName, TokenTable } from "./TokenTable";
import { findSemanticColorGroup, listPalettes } from "./tokenValues";

function ThemeCell({ tokenRef, value }: { tokenRef: string; value: string }) {
  const styles = themeCell();

  return (
    <span className={styles.root}>
      <span
        aria-hidden
        className={styles.swatch}
        style={{ background: value }}
      />
      <span className={styles.text}>
        <TokenName>{value}</TokenName>
        <span className={styles.ref}>{tokenRef.replace(/^colors\./, "")}</span>
      </span>
    </span>
  );
}

/** `bg`·`fg`처럼 역할 하나에 속한 시맨틱 색상 토큰과 테마별 값 */
export function SemanticColorTable({ group }: { group: string }) {
  const { rows } = findSemanticColorGroup(group);

  return (
    <TokenTable
      caption={`${group} 시맨틱 색상 토큰 목록`}
      columns={["토큰", "라이트", "다크"]}
      rows={rows.map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <ThemeCell
            key="light"
            tokenRef={row.lightRef}
            value={row.lightValue}
          />,
          <ThemeCell key="dark" tokenRef={row.darkRef} value={row.darkValue} />,
        ],
      }))}
    />
  );
}

/** 시맨틱 토큰이 참조하는 원본 팔레트 전체 */
export function PaletteGrid() {
  const styles = paletteGrid();

  return (
    <>
      {listPalettes().map((palette) => (
        <div key={palette.name} className={styles.block}>
          <p className={styles.name}>
            <TokenName>{palette.name}</TokenName>
            {palette.counterpart && (
              <span className={styles.ref}>
                {palette.isDark ? "라이트" : "다크"} 짝: {palette.counterpart}
              </span>
            )}
          </p>
          <ul className={styles.grid}>
            {palette.shades.map((shade) => (
              <li key={shade.name} className={styles.cell}>
                <span
                  aria-hidden
                  className={styles.swatch}
                  style={{ background: shade.value }}
                />
                <span className={styles.shade}>{shade.name}</span>
                <span className={styles.ref}>{shade.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

const themeCell = sva({
  slots: ["root", "swatch", "text", "ref"],
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8",
    },
    swatch: {
      display: "inline-block",
      width: "32px",
      height: "32px",
      flexShrink: 0,
      borderRadius: "sm",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.neutral",
    },
    text: {
      display: "inline-flex",
      flexDirection: "column",
      gap: "2",
    },
    ref: {
      textStyle: "caption",
      color: "fg.neutral.placeholder",
    },
  },
});

const paletteGrid = sva({
  slots: ["block", "name", "grid", "cell", "swatch", "shade", "ref"],
  base: {
    block: { mt: "24" },
    name: {
      display: "flex",
      alignItems: "center",
      gap: "8",
      mb: "8",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
      gap: "8",
      listStyle: "none",
      pl: "0",
    },
    cell: {
      display: "flex",
      flexDirection: "column",
      gap: "4",
    },
    swatch: {
      display: "block",
      height: "40px",
      borderRadius: "sm",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.neutral",
    },
    shade: {
      textStyle: "label.sm",
      color: "fg.neutral.active",
    },
    ref: {
      textStyle: "caption",
      color: "fg.neutral.placeholder",
    },
  },
});
