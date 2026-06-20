import { Link } from "react-router";
import { css } from "../../../../styled-system/css";

const LINK_ITEMS = [
  {
    id: 1,
    label: "docs",
    href: "/docs",
  },
  {
    id: 2,
    label: "showcase",
    href: "/showcase",
  },
  {
    id: 3,
    label: "blog",
    href: "/blog",
  },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className={navLinksStyle}>
      {LINK_ITEMS.map((item) => (
        <li
          key={item.id}
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
  gap: "24",
  flexDirection: { base: "column", lg: "row" },
  justifyContent: { base: "stretch", lg: "end" },
  alignItems: { base: "stretch", lg: "center" },
  width: "100%",
  px: { base: "16", lg: "24" },
});
