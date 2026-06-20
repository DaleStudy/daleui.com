import { Icon } from "daleui";
import { useEffect, useState } from "react";
import { css, cva } from "../../../../styled-system/css";
import { NavLogo } from "./NavLogo";
import { NavExternalLinks } from "./NavExternalLinks";
import { NavLinks } from "./NavLinks";

const MENU_ID = "blog-nav-menu";

export function Navigation() {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const handleToggleMenu = () => {
    setIsOpenMenu((v) => !v);
  };

  const closeMenu = () => {
    setIsOpenMenu(false);
  };

  useEffect(() => {
    if (!isOpenMenu) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpenMenu]);

  return (
    <nav
      className={css({
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "16",
        width: "100%",
        px: { base: "16", lg: "24" },
        py: "8",
      })}
    >
      <NavLogo />

      {/* 햄버거바 */}
      <button
        type="button"
        onClick={handleToggleMenu}
        aria-label={isOpenMenu ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={isOpenMenu}
        aria-controls={MENU_ID}
        className={css({
          display: { base: "inline-flex", lg: "none" },
          marginLeft: "auto",
          padding: "8",
          cursor: "pointer",
        })}
      >
        <Icon tone="brand" name={isOpenMenu ? "x" : "menu"} size="lg" />
      </button>

      <div id={MENU_ID} className={menuPanelStyle({ isOpenMenu })}>
        <NavLinks onNavigate={closeMenu} />
        <NavExternalLinks />
      </div>
    </nav>
  );
}

const menuPanelStyle = cva({
  base: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "bg.neutral",
    boxShadow: "lg",
    py: "8",
    transition:
      "opacity 200ms ease, transform 200ms ease, visibility 200ms ease",
    lg: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      position: "static",
      boxShadow: "none",
      backgroundColor: "transparent",
      py: 0,
      opacity: 1,
      visibility: "visible",
      transform: "none",
      pointerEvents: "auto",
    },
  },
  variants: {
    isOpenMenu: {
      true: {
        opacity: 1,
        visibility: "visible",
        transform: "translateY(0)",
        pointerEvents: "auto",
      },
      false: {
        opacity: 0,
        visibility: "hidden",
        transform: "translateY(-8px)",
        pointerEvents: "none",
      },
    },
  },
});
