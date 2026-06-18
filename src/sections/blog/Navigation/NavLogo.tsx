import { Flex, Tag } from "daleui";
import { Link } from "react-router";
import { css } from "../../../../styled-system/css";
import { useTheme } from "../../../hooks/useTheme";

export function NavLogo() {
  const { isDark } = useTheme();

  return (
    <Flex
      className={css({
        px: "16",
        py: "8",
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
      <Tag tone="brand">Blog</Tag>
    </Flex>
  );
}
