import { Icon, Link } from "daleui";
import { css, sva } from "../../../../styled-system/css";
import { useTheme } from "../../../hooks/useTheme";
import { EXTERNAL_LINKS } from "./links";

export function NavExternalLinks() {
  const { isDark, toggleTheme } = useTheme();
  const style = navExternalLink();
  return (
    <ul className={style.ul}>
      {EXTERNAL_LINKS.map((item) => (
        <li key={item.href} className={style.li}>
          <Link
            href={item.href}
            external
            underline={false}
            tone="neutral"
            size="md"
            aria-label={item.label}
          >
            <Icon name={item.icon} size="md" />
          </Link>
        </li>
      ))}
      <li className={style.li}>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          className={css({
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Icon name={isDark ? "moon" : "sun"} size="md" tone="brand" />
        </button>
      </li>
    </ul>
  );
}

const navExternalLink = sva({
  slots: ["ul", "li"],
  base: {
    ul: {
      display: "flex",
      justifyContent: { base: "end", lg: "start" },
      gap: "24",
      alignItems: "center",
      px: "16",
      py: "8",
    },
    li: { display: "flex", alignItems: "center" },
  },
});
