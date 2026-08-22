import { css } from "../../../../styled-system/css";
import { TokenName, TokenTable, TokenValue } from "./TokenTable";
import { flattenTokens, pxLabel } from "./tokenValues";
import { spacing } from "../../../tokens/spacing";

const spacingRows = flattenTokens(spacing);

/** 스페이싱 스케일 전체와 실제 폭 */
export function SpacingTable() {
  return (
    <TokenTable
      caption="스페이싱 토큰 목록"
      columns={["토큰", "rem", "px", "크기"]}
      rows={spacingRows.map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="rem">{row.value}</TokenValue>,
          <TokenValue key="px">{pxLabel(row.value)}</TokenValue>,
          <span
            key="bar"
            aria-hidden
            className={bar}
            style={{ width: row.value }}
          />,
        ],
      }))}
    />
  );
}

const bar = css({
  display: "block",
  height: "12px",
  minWidth: "1px",
  borderRadius: "xs",
  backgroundColor: "bgSolid.brand",
});
