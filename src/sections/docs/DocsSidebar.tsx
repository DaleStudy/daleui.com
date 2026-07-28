import { Icon } from "daleui";
import { useState } from "react";
import { Link } from "react-router";
import { css, cva } from "../../../styled-system/css";
import { DOCS_NAV, type DocsNavCategory, findCategoryTitle } from "./docsNav";

interface DocsSidebarProps {
  /** 현재 열려 있는 문서 id */
  currentId: string;
  /** 링크 이동 시 실행할 콜백 (모바일 드로어 닫기 등) */
  onNavigate?: () => void;
}

export function DocsSidebar({ currentId, onNavigate }: DocsSidebarProps) {
  const activeCategory = findCategoryTitle(currentId);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const isOpen = (category: DocsNavCategory) => {
    if (Object.prototype.hasOwnProperty.call(openMap, category.title)) {
      return openMap[category.title];
    }
    return category.title === activeCategory;
  };

  const toggle = (title: string, open: boolean) => {
    setOpenMap((prev) => ({ ...prev, [title]: !open }));
  };

  return (
    <nav aria-label="문서 목차">
      {DOCS_NAV.map((category) => {
        const open = isOpen(category);
        const categoryActive = category.title === activeCategory;

        return (
          <div key={category.title} className={css({ pb: "8" })}>
            <button
              type="button"
              onClick={() => toggle(category.title, open)}
              aria-expanded={open}
              className={categoryButton({ active: categoryActive })}
            >
              <div className={chevron({ open })}>
                <Icon name="chevronRight" size="sm" />
              </div>
              <span>{category.title}</span>
            </button>

            {open &&
              category.groups.map((group, groupIndex) => (
                <div key={group.label ?? groupIndex}>
                  {group.label && (
                    <div className={groupLabel}>{group.label}</div>
                  )}
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/docs/${item.id}`}
                      onClick={onNavigate}
                      aria-current={item.id === currentId ? "page" : undefined}
                      className={navItem({
                        active: item.id === currentId,
                        indent: Boolean(group.label),
                      })}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ))}
          </div>
        );
      })}
    </nav>
  );
}

const categoryButton = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    px: "12",
    py: "8",
    mt: "8",
    borderRadius: "sm",
    textStyle: "label.md",
    fontWeight: "bold",
    _hover: { backgroundColor: "bg.neutral.hover" },
  },
  variants: {
    active: {
      true: { color: "fg.brand" },
      false: { color: "fg.neutral.active" },
    },
  },
});

const chevron = cva({
  base: {
    flexShrink: 0,
    transition: "transform 0.18s ease",
    color: "fg.neutral.placeholder",
  },
  variants: {
    open: {
      true: { transform: "rotate(90deg)" },
      false: { transform: "rotate(0deg)" },
    },
  },
});

const groupLabel = css({
  pt: "12",
  pb: "4",
  px: "24",
  textStyle: "label.sm",
  fontWeight: "semibold",
});

const navItem = cva({
  base: {
    display: "block",
    width: "100%",
    textAlign: "left",
    textDecoration: "none",
    textStyle: "body.sm",
    py: "4",
    pr: "12",
    transition: "0.15s",
  },
  variants: {
    active: {
      true: {
        fontWeight: "semibold",
        backgroundColor: "bg.brand",
        color: "fg.brand",
        _hover: { backgroundColor: "bg.brand", color: "fg.brand" },
      },
      false: {
        fontWeight: "normal",
        backgroundColor: "transparent",
        color: "fg.neutral",
        _hover: {
          backgroundColor: "bg.neutral.hover",
          color: "fg.neutral.active",
        },
      },
    },
    indent: {
      true: {
        pl: "40",
      },
      false: {
        pl: "24",
      },
    },
  },
});
