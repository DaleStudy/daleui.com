import { Icon } from "daleui";
import { sva } from "../../../../styled-system/css";
import { listIconNames } from "./iconNames";

/** 이름으로 골라 쓸 수 있는 아이콘 전체 목록 */
export function IconGallery({ kind }: { kind: string }) {
  const names = listIconNames(kind);
  const styles = iconGallery();

  return (
    <>
      <p className={styles.count}>{names.length}개</p>
      <ul className={styles.grid}>
        {names.map((name) => (
          <li key={name} className={styles.card}>
            <Icon name={name} size="lg" aria-hidden />
            <span className={styles.name}>{name}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

const iconGallery = sva({
  slots: ["count", "grid", "card", "name"],
  base: {
    count: {
      textStyle: "caption",
      color: "fg.neutral.placeholder",
      mb: "12",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
      gap: "12",
      listStyle: "none",
      pl: "0",
    },
    card: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8",
      p: "12",
      borderRadius: "md",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.neutral",
      color: "fg.neutral",
    },
    name: {
      textStyle: "caption",
      color: "fg.neutral.placeholder",
      textAlign: "center",
      wordBreak: "break-all",
    },
  },
});
