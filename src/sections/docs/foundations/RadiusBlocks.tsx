import { css } from "../../../../styled-system/css";
import { TokenName, TokenTable, TokenValue } from "./TokenTable";
import { flattenTokens, pxLabel } from "./tokenValues";
import { radii } from "../../../tokens/radii";

const radiusRows = flattenTokens(radii);

/** 모서리 반경 단계 */
export function RadiusTable() {
  return (
    <TokenTable
      caption="모서리 반경 토큰 목록"
      columns={["토큰", "값", "px", "미리보기"]}
      rows={radiusRows.map((row) => ({
        key: row.name,
        cells: [
          <TokenName key="name">{row.name}</TokenName>,
          <TokenValue key="value">{row.value}</TokenValue>,
          <TokenValue key="px">{pxLabel(row.value)}</TokenValue>,
          <span
            key="sample"
            aria-hidden
            className={cornerSample}
            style={{ borderRadius: row.value }}
          />,
        ],
      }))}
    />
  );
}

const cornerSample = css({
  display: "block",
  width: "48px",
  height: "32px",
  backgroundColor: "bg.brand",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.brand",
});
