import { Link } from "react-router";
import { sva } from "../../../../styled-system/css";
import { INTERNAL_LINKS } from "./links";

interface NavLinksProps {
  /** 링크 이동 시 실행할 콜백 (모바일 메뉴 닫기 등) */
  onNavigate?: () => void;
}

export function NavLinks({ onNavigate }: NavLinksProps) {
  const styles = navLinks();

  return (
    <ul className={styles.list}>
      {INTERNAL_LINKS.map((item) => (
        <li key={item.href} className={styles.item}>
          <Link to={item.href} onClick={onNavigate} className={styles.link}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const navLinks = sva({
  slots: ["list", "item", "link"],
  base: {
    list: {
      display: "flex",
      flexDirection: { base: "column", lg: "row" },
      gap: "24",
      px: { base: "16", lg: "24" },
      flexShrink: 0,
    },
    item: {
      display: "flex",
      alignItems: "center",
    },
    link: {
      textStyle: "label.lg",
      textDecoration: "none",
      whiteSpace: "nowrap",
      color: "fg.neutral",
      transition: "0.2s",
      _hover: {
        color: "fg.brand",
        textDecoration: "underline",
      },
    },
  },
});
