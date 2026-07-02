import { Icon, Link } from "daleui";
import { css } from "../../../../styled-system/css";
import { useTheme } from "../../../hooks/useTheme";
import { EXTERNAL_LINKS } from "./links";

export function NavExternalLinks() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <ul className={navExternalLinksStyle}>
      {EXTERNAL_LINKS.map((item) => (
        <li
          key={item.href}
          className={css({ display: "flex", alignItems: "center" })}
        >
          <Link
            href={item.href}
            external
            underline={false}
            tone="neutral"
            size="lg"
            aria-label={item.label}
          >
            <Icon name={item.icon} size="lg" />
          </Link>
        </li>
      ))}
      <li className={css({ display: "flex", alignItems: "center" })}>
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
          <Icon name={isDark ? "moon" : "sun"} size="lg" tone="brand" />
        </button>
      </li>
    </ul>
  );
}

const navExternalLinksStyle = css({
  display: "flex",
  justifyContent: { base: "end", lg: "start" },
  gap: "24",
  alignItems: "center",
  px: { base: "16", lg: "0" },
  py: { base: "8", lg: "0" },
});
