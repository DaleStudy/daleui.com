import { useNavigate } from "react-router";
import { css, cva } from "../../../styled-system/css";
import { scrollSmoothly } from "../../utils/scrollSmoothly";

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
  /** 목차 링크로 이동을 시작했을 때 */
  onNavigateStart?: (id: string) => void;
  /** 그 이동의 스크롤이 끝났을 때 */
  onNavigateEnd?: (id: string) => void;
}

export function DocsToc({
  items,
  activeId,
  onNavigateStart,
  onNavigateEnd,
}: DocsTocProps) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigateStart?.(id);
    scrollSmoothly(
      () => navigate(`#${id}`, { preventScrollReset: true }),
      () => onNavigateEnd?.(id),
    );
  };

  return (
    <nav aria-label="이 문서의 목차">
      <p className={heading}>목차</p>
      <ul className={list}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => handleClick(event, item.id)}
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
  textStyle: "label.sm",
  fontWeight: "bold",
  color: "fg.neutral.active",
  mb: "12",
});

const list = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
  borderLeftWidth: "1px",
  borderLeftStyle: "solid",
  borderColor: "border.neutral",
});

const link = cva({
  base: {
    display: "block",
    textDecoration: "none",
    textStyle: "body.sm",
    py: "4",
    ml: "-1px",
    borderLeftWidth: "2px",
    borderLeftStyle: "solid",
    transition: "0.15s",
    _hover: { color: "fg.neutral.active" },
  },
  variants: {
    active: {
      true: {
        borderColor: "fg.brand",
        color: "fg.brand",
        fontWeight: "semibold",
        _hover: { color: "fg.brand" },
      },
      false: { borderColor: "transparent", color: "fg.neutral" },
    },
    nested: {
      true: { pl: "28px" },
      false: { pl: "14px" },
    },
  },
});
