import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CodeTab, CodeTabs } from "./CodeTabs";

function renderTabs() {
  return render(
    <CodeTabs>
      <CodeTab label="npm">npm install daleui</CodeTab>
      <CodeTab label="pnpm">pnpm add daleui</CodeTab>
      <CodeTab label="bun">bun add daleui</CodeTab>
    </CodeTabs>,
  );
}

describe("CodeTabs", () => {
  it("탭이 없으면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(<CodeTabs>{null}</CodeTabs>);

    expect(container).toBeEmptyDOMElement();
  });

  it("CodeTab은 자식을 그대로 렌더링한다", () => {
    render(<CodeTab label="npm">npm install daleui</CodeTab>);

    expect(screen.getByText("npm install daleui")).toBeInTheDocument();
  });

  it("첫 번째 탭의 내용만 보여 준다", () => {
    renderTabs();

    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
      "npm",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "npm install daleui",
    );
  });

  it("탭을 클릭하면 해당 내용으로 바뀐다", async () => {
    renderTabs();

    await userEvent.click(screen.getByRole("tab", { name: "bun" }));

    expect(screen.getByRole("tabpanel")).toHaveTextContent("bun add daleui");
  });

  it("방향키로 탭을 옮긴다", async () => {
    renderTabs();

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
      "pnpm",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("pnpm add daleui");
  });

  it("첫 탭에서 왼쪽 방향키를 누르면 마지막 탭으로 순환한다", async () => {
    renderTabs();

    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");

    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
      "bun",
    );
  });

  it("다루지 않는 키는 선택을 바꾸지 않는다", async () => {
    renderTabs();

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");

    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
      "npm",
    );
  });

  it("탭 목록에서 선택된 탭만 초점을 받는다", () => {
    renderTabs();

    const [npm, pnpm] = screen.getAllByRole("tab");

    expect(npm).toHaveAttribute("tabindex", "0");
    expect(pnpm).toHaveAttribute("tabindex", "-1");
  });
});
