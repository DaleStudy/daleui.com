import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useHashFocus } from "./useHashFocus";

function Consumer() {
  useHashFocus();
  return null;
}

function renderTarget(id: string) {
  const heading = document.createElement("h2");
  heading.id = id;
  document.body.appendChild(heading);
  return heading;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Consumer />
    </MemoryRouter>,
  );
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("useHashFocus", () => {
  it("다음 Tab이 목차에 머물지 않도록 대상에 포커스를 옮긴다", () => {
    const heading = renderTarget("usage");

    renderAt("/docs/button#usage");

    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(heading);
  });

  it("퍼센트 인코딩된 해시도 대상을 찾는다", () => {
    const heading = renderTarget("사용법");

    renderAt(`/docs/button#${encodeURIComponent("사용법")}`);

    expect(document.activeElement).toBe(heading);
  });

  it("인코딩이 깨진 해시에서도 예외를 던지지 않는다", () => {
    const heading = renderTarget("%");

    expect(() => renderAt("/docs/button#%")).not.toThrow();
    expect(document.activeElement).toBe(heading);
  });

  it("해시가 없으면 아무것도 하지 않는다", () => {
    const heading = renderTarget("usage");

    renderAt("/docs/button");

    expect(heading.hasAttribute("tabindex")).toBe(false);
    expect(document.activeElement).not.toBe(heading);
  });

  it("해시에 대응하는 요소가 없으면 아무것도 하지 않는다", () => {
    const heading = renderTarget("usage");

    renderAt("/docs/button#missing");

    expect(heading.hasAttribute("tabindex")).toBe(false);
  });

  it("포커스가 떠나면 tabindex를 회수한다", () => {
    const heading = renderTarget("usage");

    renderAt("/docs/button#usage");
    heading.dispatchEvent(new Event("blur"));

    expect(heading.hasAttribute("tabindex")).toBe(false);
  });

  it("언마운트하면 tabindex를 회수한다", () => {
    const heading = renderTarget("usage");

    renderAt("/docs/button#usage").unmount();

    expect(heading.hasAttribute("tabindex")).toBe(false);
  });
});
