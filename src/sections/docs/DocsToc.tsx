import { css, cva } from "../../../styled-system/css";

/** 목차 항목 */
export interface TocItem {
  /** 대상 heading의 id */
  id: string;
  /** 표시 라벨 */
  label: string;
  /** 들여쓰기 단계 (2 = h2, 3 = h3) */
  depth?: 2 | 3;
}

interface DocsTocProps {
  items: TocItem[];
  /** 현재 활성화된 항목 id */
  activeId?: string;
}

export function DocsToc({ items, activeId }: DocsTocProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="이 문서의 목차">
      <p className={heading}>목차</p>
      <ul className={list}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === activeId ? "location" : undefined}
              className={link({
                active: item.id === activeId,
                nested: item.depth === 3,
              })}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const heading = css({
  textStyle: "label.md",
  fontWeight: "semibold",
  color: "fg.neutral.active",
  mb: "12",
});

const list = css({
  display: "flex",
  flexDirection: "column",
});

const link = cva({
  base: {
    display: "block",
    textDecoration: "none",
    textStyle: "body.sm",
    py: "4",
    borderRadius: "sm",
    transition: "0.15s",
    _hover: { color: "fg.brand" },
  },
  variants: {
    active: {
      true: { color: "fg.brand", fontWeight: "medium" },
      false: { color: "fg.neutral" },
    },
    nested: {
      true: { pl: "16" },
      false: { pl: "0" },
    },
  },
});
