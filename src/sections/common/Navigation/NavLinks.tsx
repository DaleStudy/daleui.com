import { Link } from "react-router";
import { css } from "../../../../styled-system/css";
import { INTERNAL_LINKS } from "./links";

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className={navLinksStyle}>
      {INTERNAL_LINKS.map((item) => (
        <li
          key={item.href}
          className={css({ display: "flex", alignItems: "center" })}
        >
          <Link
            to={item.href}
            onClick={onNavigate}
            className={css({
              textStyle: "label.lg",
              textDecoration: "none",
              color: "fg.neutral",
              _hover: {
                color: "fg.brand",
                textDecoration: "underline",
              },
            })}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const navLinksStyle = css({
  display: "flex",
  flexShrink: 0,
  gap: "24",
  flexDirection: { base: "column", lg: "row" },
  px: { base: "16", lg: "24" },
});
