import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LiveDemo, LiveDemoSlot } from "./LiveDemo";

function renderDemo(code = "<Button>저장</Button>") {
  return render(
    <LiveDemo>
      <LiveDemoSlot name="preview">
        <button type="button">저장</button>
      </LiveDemoSlot>
      <LiveDemoSlot name="code">
        <pre>{code}</pre>
      </LiveDemoSlot>
    </LiveDemo>,
  );
}

describe("LiveDemo", () => {
  it("프리뷰 탭을 먼저 보여 준다", () => {
    renderDemo();

    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
      "프리뷰",
    );
    expect(screen.getByRole("button", { name: "저장" })).toBeVisible();
  });

  it("코드 탭으로 옮기면 같은 코드를 보여 준다", async () => {
    renderDemo();

    await userEvent.click(screen.getByRole("tab", { name: "코드" }));

    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "<Button>저장</Button>",
    );
    expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
  });

  it("슬롯이 비어 있어도 탭은 그대로 둔다", () => {
    render(
      <LiveDemo>
        <LiveDemoSlot name="preview">
          <button type="button">저장</button>
        </LiveDemoSlot>
      </LiveDemo>,
    );

    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("슬롯 컴포넌트는 자식을 그대로 렌더링한다", () => {
    const { container } = render(
      <>
        <LiveDemoSlot name="preview">프리뷰</LiveDemoSlot>
        <LiveDemoSlot name="code">코드</LiveDemoSlot>
      </>,
    );

    expect(container).toHaveTextContent("프리뷰코드");
  });
});
