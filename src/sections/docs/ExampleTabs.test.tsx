import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ExampleTabs } from "./ExampleTabs";

function renderTabs(code = "<Button>저장</Button>") {
  return render(
    <ExampleTabs>
      <button type="button">저장</button>
      <pre>{code}</pre>
    </ExampleTabs>,
  );
}

describe("ExampleTabs", () => {
  it("첫 자식을 프리뷰 탭에 먼저 보여 준다", () => {
    renderTabs();

    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
      "프리뷰",
    );
    expect(screen.getByRole("button", { name: "저장" })).toBeVisible();
  });

  it("코드 탭으로 옮기면 두 번째 자식을 보여 준다", async () => {
    renderTabs();

    await userEvent.click(screen.getByRole("tab", { name: "코드" }));

    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "<Button>저장</Button>",
    );
    expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
  });

  it("자식이 하나뿐이어도 탭은 그대로 둔다", () => {
    render(
      <ExampleTabs>
        <button type="button">저장</button>
      </ExampleTabs>,
    );

    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });
});
