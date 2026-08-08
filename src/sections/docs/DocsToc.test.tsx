import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocsToc, type TocItem } from "./DocsToc";

const ITEMS: TocItem[] = [
  { id: "overview", label: "개요", depth: 2 },
  { id: "usage-basic", label: "기본 사용", depth: 3 },
];

function LocationProbe() {
  const { pathname, hash } = useLocation();
  return <output>{`${pathname}${hash}`}</output>;
}

function renderToc(props: Partial<React.ComponentProps<typeof DocsToc>> = {}) {
  return render(
    <MemoryRouter initialEntries={["/docs/button"]}>
      <DocsToc items={ITEMS} {...props} />
      <LocationProbe />
    </MemoryRouter>,
  );
}

afterEach(() => {
  // 진행 중인 스크롤 상태를 다음 테스트로 넘기지 않습니다.
  window.dispatchEvent(new Event("scrollend"));
  document.documentElement.style.scrollBehavior = "";
  vi.restoreAllMocks();
});

describe("DocsToc", () => {
  it("항목이 없으면 아무것도 렌더링하지 않는다", () => {
    render(
      <MemoryRouter>
        <DocsToc items={[]} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("활성 항목을 aria-current로 알린다", () => {
    renderToc({ activeId: "usage-basic" });

    expect(screen.getByRole("link", { name: "기본 사용" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: "개요" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("클릭하면 경로를 유지한 채 해시로 이동한다", async () => {
    const user = userEvent.setup();
    renderToc();

    await user.click(screen.getByRole("link", { name: "기본 사용" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "/docs/button#usage-basic",
    );
  });

  it("이동을 시작할 때와 끝날 때를 알린다", async () => {
    const user = userEvent.setup();
    const onNavigateStart = vi.fn();
    const onNavigateEnd = vi.fn();
    renderToc({ onNavigateStart, onNavigateEnd });

    await user.click(screen.getByRole("link", { name: "개요" }));

    expect(onNavigateStart).toHaveBeenCalledWith("overview");
    expect(onNavigateEnd).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("scrollend"));

    expect(onNavigateEnd).toHaveBeenCalledWith("overview");
  });

  it("모디파이어 키를 누른 클릭은 브라우저 기본 동작에 맡긴다", async () => {
    const user = userEvent.setup();
    const onNavigateStart = vi.fn();
    renderToc({ onNavigateStart });

    await user.keyboard("{Meta>}");
    await user.click(screen.getByRole("link", { name: "개요" }));
    await user.keyboard("{/Meta}");

    expect(onNavigateStart).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("/docs/button");
  });
});
