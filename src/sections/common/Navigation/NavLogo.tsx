import { Flex, Tag } from "daleui";
import { Link, useLocation } from "react-router";
import { css } from "../../../../styled-system/css";
import { useTheme } from "../../../hooks/useTheme";

function getSectionLabel(pathname: string): string | null {
  if (pathname.startsWith("/docs")) return "문서";
  if (pathname.startsWith("/showcase")) return "모범사례";
  if (pathname.startsWith("/blog")) return "블로그";
  return null;
}

export function NavLogo() {
  const { isDark } = useTheme();
  const { pathname } = useLocation();
  const sectionLabel = getSectionLabel(pathname);

  return (
    <Flex
      className={css({
        p: "16",
      })}
      align="center"
      gap="8"
    >
      <Link to="/">
        <img
          src={isDark ? "/newLogoWithText_dark.svg" : "/newLogoWithText.svg"}
          alt="DaleUI Logo"
          className={css({
            objectFit: "contain",
          })}
        />
      </Link>
      {sectionLabel ? <Tag tone="brand">{sectionLabel}</Tag> : null}
    </Flex>
  );
}
