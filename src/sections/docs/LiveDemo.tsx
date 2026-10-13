import {
  Children,
  type ReactElement,
  type ReactNode,
  isValidElement,
} from "react";
import { css } from "../../../styled-system/css";
import { CodeTab, CodeTabs } from "./CodeTabs";

type SlotName = "preview" | "code";

interface LiveDemoSlotProps {
  /** 채울 자리. `preview`는 라이브 렌더링, `code`는 Expressive Code 블록입니다. */
  name: SlotName;
  children: ReactNode;
}

/** LiveDemo의 한 자리를 채웁니다. `remark-live-demo`가 코드 펜스에서 만들어 줍니다. */
export function LiveDemoSlot({ children }: LiveDemoSlotProps) {
  return <>{children}</>;
}

/** 프리뷰와 코드는 서로 다른 탭으로 흩어지므로 children을 그대로 넘기지 못하고 자리별로 골라냅니다. */
function slot(children: ReactNode, name: SlotName): ReactNode {
  const found = Children.toArray(children).find(
    (child): child is ReactElement<LiveDemoSlotProps> =>
      isValidElement<LiveDemoSlotProps>(child) && child.props.name === name,
  );

  return found ? found.props.children : null;
}

export function LiveDemo({ children }: { children: ReactNode }) {
  return (
    <CodeTabs>
      <CodeTab label="프리뷰">
        <div className={stage}>{slot(children, "preview")}</div>
      </CodeTab>
      <CodeTab label="코드">{slot(children, "code")}</CodeTab>
    </CodeTabs>
  );
}

const stage = css({
  p: "24",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.neutral",
  borderRadius: "md",
  backgroundColor: "bg.neutral",
});
