import {
  Children,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  isValidElement,
  useId,
  useRef,
  useState,
} from "react";
import { css, cva } from "../../../styled-system/css";

interface CodeTabProps {
  /** 탭 버튼에 표시할 이름 */
  label: string;
  children: ReactNode;
}

/** CodeTabs 안에서 탭 하나를 정의합니다. */
export function CodeTab({ children }: CodeTabProps) {
  return <>{children}</>;
}

/** 같은 작업을 도구별로 보여 줄 때 코드 블록을 탭으로 묶습니다. */
export function CodeTabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<CodeTabProps> =>
      isValidElement<CodeTabProps>(child) &&
      typeof child.props.label === "string",
  );

  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  if (tabs.length === 0) {
    return null;
  }

  const select = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setSelected(next);
    buttons.current[next]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowLeft: selected - 1,
      ArrowRight: selected + 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = moves[event.key];

    if (next === undefined) {
      return;
    }

    event.preventDefault();
    select(next);
  };

  return (
    <div className={wrapper}>
      <div role="tablist" onKeyDown={handleKeyDown} className={tablist}>
        {tabs.map((tab, index) => (
          <button
            key={tab.props.label}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={index === selected}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            className={tabButton({ selected: index === selected })}
          >
            {tab.props.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.props.label}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== selected}
        >
          {tab.props.children}
        </div>
      ))}
    </div>
  );
}

const wrapper = css({ my: "24" });

const tablist = css({
  display: "flex",
  gap: "4",
  mb: "8",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.neutral",
});

const tabButton = cva({
  base: {
    px: "12",
    py: "8",
    textStyle: "label.sm",
    cursor: "pointer",
    mb: "-1px",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    transition: "0.15s",
    _hover: { color: "fg.neutral.active" },
  },
  variants: {
    selected: {
      true: {
        borderColor: "fg.brand",
        color: "fg.brand",
        fontWeight: "semibold",
        _hover: { color: "fg.brand" },
      },
      false: { borderColor: "transparent", color: "fg.neutral" },
    },
  },
});
