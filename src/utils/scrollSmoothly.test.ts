import { afterEach, describe, expect, it, vi } from "vitest";
import { scrollSmoothly } from "./scrollSmoothly";

function setReducedMotion(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches } as MediaQueryList);
}

afterEach(() => {
  // 진행 중인 스크롤 상태를 다음 테스트로 넘기지 않습니다.
  window.dispatchEvent(new Event("scrollend"));
  document.documentElement.style.scrollBehavior = "";
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("scrollSmoothly", () => {
  it("이동하는 동안 문서에 smooth 스크롤을 걸어 준다", () => {
    expect.assertions(1);
    setReducedMotion(false);

    scrollSmoothly(() => {
      expect(document.documentElement.style.scrollBehavior).toBe("smooth");
    });
  });

  it("스크롤이 끝나면 smooth를 되돌리고 알린다", () => {
    setReducedMotion(false);
    const onSettled = vi.fn();

    scrollSmoothly(() => {}, onSettled);
    window.dispatchEvent(new Event("scrollend"));

    expect(document.documentElement.style.scrollBehavior).toBe("");
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("scrollend가 오지 않아도 일정 시간 뒤 되돌린다", () => {
    vi.useFakeTimers();
    setReducedMotion(false);
    const onSettled = vi.fn();

    scrollSmoothly(() => {}, onSettled);
    expect(document.documentElement.style.scrollBehavior).toBe("smooth");
    vi.advanceTimersByTime(1500);

    expect(document.documentElement.style.scrollBehavior).toBe("");
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("이어서 호출하면 앞 호출을 정리한다", () => {
    setReducedMotion(false);
    const first = vi.fn();
    const second = vi.fn();

    scrollSmoothly(() => {}, first);
    scrollSmoothly(() => {}, second);

    expect(first).toHaveBeenCalledOnce();
    expect(document.documentElement.style.scrollBehavior).toBe("smooth");

    window.dispatchEvent(new Event("scrollend"));

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("scrollend가 두 번 와도 한 번만 알린다", () => {
    setReducedMotion(false);
    const onSettled = vi.fn();

    scrollSmoothly(() => {}, onSettled);
    window.dispatchEvent(new Event("scrollend"));
    window.dispatchEvent(new Event("scrollend"));

    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("모션 최소화 설정이면 smooth 없이 즉시 이동하고 알린다", () => {
    setReducedMotion(true);
    const navigate = vi.fn();
    const onSettled = vi.fn();

    scrollSmoothly(navigate, onSettled);

    expect(document.documentElement.style.scrollBehavior).toBe("");
    expect(navigate).toHaveBeenCalledOnce();
    expect(onSettled).toHaveBeenCalledOnce();
  });
});
