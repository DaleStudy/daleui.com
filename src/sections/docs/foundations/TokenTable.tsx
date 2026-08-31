import { sva } from "../../../../styled-system/css";

export interface TokenTableRow {
  key: string;
  cells: React.ReactNode[];
}

interface TokenTableProps {
  /** 표 헤더 라벨 */
  columns: string[];
  rows: TokenTableRow[];
  /** 스크린 리더에 읽히는 표 설명 */
  caption: string;
}

export function TokenTable({ columns, rows, caption }: TokenTableProps) {
  const broken = rows.find((row) => row.cells.length !== columns.length);
  if (broken) {
    throw new Error(`${caption}의 ${broken.key} 칸 수가 헤더와 다릅니다`);
  }

  const styles = tokenTable();

  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className={styles.headCell}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.key}-${columns[index]}`}
                  className={styles.bodyCell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 토큰 이름처럼 그대로 복사해 쓰는 문자열 */
export function TokenName({ children }: { children: React.ReactNode }) {
  return <code className={tokenTable().name}>{children}</code>;
}

/** 토큰이 가진 값. 표의 값 칸은 모두 이 모양으로 씁니다. */
export function TokenValue({ children }: { children: React.ReactNode }) {
  return <span className={tokenTable().value}>{children}</span>;
}

const tokenTable = sva({
  slots: [
    "scroller",
    "table",
    "caption",
    "headCell",
    "bodyCell",
    "name",
    "value",
  ],
  base: {
    scroller: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      textStyle: "body.sm",
    },
    caption: { srOnly: true },
    headCell: {
      textStyle: "label.sm",
      color: "fg.neutral.active",
      textAlign: "left",
      whiteSpace: "nowrap",
      px: "12",
      py: "8",
      backgroundColor: "bg.neutral.hover",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderColor: "border.neutral",
    },
    bodyCell: {
      color: "fg.neutral",
      verticalAlign: "middle",
      px: "12",
      py: "8",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderColor: "border.neutral",
    },
    name: {
      textStyle: "code",
      color: "fg.neutral.active",
      backgroundColor: "bg.neutral.hover",
      borderRadius: "sm",
      px: "4",
      py: "2",
      whiteSpace: "nowrap",
    },
    value: {
      textStyle: "code",
      color: "fg.neutral",
      whiteSpace: "nowrap",
    },
  },
});
