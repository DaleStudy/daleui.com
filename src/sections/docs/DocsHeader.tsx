import { Icon, Tag } from "daleui";
import { useState } from "react";
import { Link } from "react-router";
import { sva } from "../../../styled-system/css";
import { useTheme } from "../../hooks/useTheme";
import { NavLinks } from "../common/Navigation/NavLinks";
import { DocsSearch } from "./DocsSearch";
import { NavExternalLinks } from "../common/Navigation/NavExternalLinks";

interface DocsHeaderProps {
  /** 모바일 사이드바 열림 여부 */
  isNavOpen: boolean;
  /** 모바일 사이드바 열기. 닫기는 드로어 자체(닫기 버튼·배경·Escape)가 담당합니다. */
  onOpenNav: () => void;
}

export function DocsHeader({ isNavOpen, onOpenNav }: DocsHeaderProps) {
  const { isDark } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const styles = docsHeader({ searchOpen: isSearchOpen });

  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="문서 목차 열기"
          aria-expanded={isNavOpen}
          className={styles.menuButton}
        >
          <Icon name="menu" size="lg" />
        </button>

        <div className={styles.logoArea}>
          <Link to="/" className={styles.logoLink}>
            <img
              src={
                isDark ? "/newLogoWithText_dark.svg" : "/newLogoWithText.svg"
              }
              alt="DaleUI Logo"
              className={styles.logoImage}
            />
          </Link>
          <div className={styles.badge}>
            <Tag tone="brand">문서</Tag>
          </div>
        </div>

        <div className={styles.spacer} />

        <nav aria-label="주요 메뉴" className={styles.links}>
          <NavLinks />
        </nav>

        <NavExternalLinks />
        <div className={styles.search}>
          <DocsSearch isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </div>
      </div>
    </header>
  );
}

const docsHeader = sva({
  slots: [
    "root",
    "inner",
    "menuButton",
    "logoArea",
    "logoLink",
    "logoImage",
    "badge",
    "spacer",
    "links",
    "search",
  ],
  base: {
    root: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      backgroundColor: "appBg",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderColor: "border.neutral",
    },
    inner: {
      display: "flex",
      alignItems: "center",
      height: { base: "54px", lg: "64px" },
      maxWidth: "1480px",
      mx: "auto",
      px: { base: "16", lg: "28px" },
    },
    menuButton: {
      display: { base: "inline-flex", lg: "none" },
    },
    logoArea: {
      display: "flex",
      alignItems: "center",
      gap: "8",
      flexShrink: 0,
      mx: { base: "auto", lg: "0" },
    },
    logoLink: {
      display: "inline-flex",
    },
    logoImage: {
      height: "32px",
      objectFit: "contain",
    },
    badge: {
      display: { base: "none", lg: "block" },
    },
    spacer: {
      display: { base: "none", lg: "block" },
      flex: 1,
    },
    links: {
      display: { base: "none", lg: "flex" },
      alignItems: "center",
      overflow: "hidden",
      whiteSpace: "nowrap",
      transition: "max-width 0.25s ease, opacity 0.2s ease",
    },
    search: {
      display: { base: "none", lg: "block" },
      pl: "16",
    },
  },
  variants: {
    /** 검색을 펼치면 메뉴를 접어 입력창 공간을 확보합니다. */
    searchOpen: {
      true: { links: { maxWidth: "0", opacity: 0, pointerEvents: "none" } },
      false: {
        links: { maxWidth: "100%", opacity: 1, pointerEvents: "auto" },
      },
    },
  },
  defaultVariants: {
    searchOpen: false,
  },
});
