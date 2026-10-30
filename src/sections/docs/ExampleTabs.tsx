import { Children, type ReactNode } from "react";
import { css } from "../../../styled-system/css";
import { CodeTab, CodeTabs } from "./CodeTabs";

/**
 * 예제 하나를 프리뷰·코드 탭으로 보여 줍니다.
 * `remark-example`이 `<Example name="..." />` 자리에 프리뷰와 코드 블록을 순서대로 넣어 줍니다.
 */
export function ExampleTabs({ children }: { children: ReactNode }) {
  const [preview, code] = Children.toArray(children);

  return (
    <CodeTabs>
      <CodeTab label="프리뷰">
        <div className={stage}>{preview}</div>
      </CodeTab>
      <CodeTab label="코드">{code}</CodeTab>
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
