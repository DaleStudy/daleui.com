import { Icon, type IconProps, Link } from "daleui";
import { css } from "../../../../styled-system/css";
import { useTheme } from "../../../hooks/useTheme";

type IconName = IconProps["name"];

const LINK_ITEMS: {
  id: number;
  label: string;
  href: string;
  icon: IconName;
}[] = [
  {
    id: 1,
    label: "깃허브",
    href: "https://github.com/DaleStudy/daleui",
    icon: "GitHub",
  },
  {
    id: 2,
    label: "스토리북",
    href: "https://main--675790d317ba346348aa3490.chromatic.com/",
    icon: "Storybook",
  },
  {
    id: 3,
    label: "피그마 디자인",
    href: "https://www.figma.com/community/file/1559487636467651573",
    icon: "Figma",
  },
];

export function NavExternalLinks() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <ul className={navExternalLinksStyle}>
      {LINK_ITEMS.map((item) => (
        <li
          key={item.id}
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
  gap: "24",
  alignItems: "center",
  justifyContent: "end",
  width: { base: "100%", lg: "auto" },
  px: { base: "16", lg: "0" },
  py: { base: "8", lg: "0" },
});
