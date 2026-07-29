import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

const QUERY = "(min-width: 1280px)";

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const list = {
    matches,
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  };

  vi.spyOn(window, "matchMedia").mockReturnValue(list as never);

  return {
    change(next: boolean) {
      list.matches = next;
      act(() => listeners.forEach((listener) => listener()));
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useMediaQuery", () => {
  it("현재 일치 여부를 반환한다", () => {
    stubMatchMedia(true);

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(true);
  });

  it("일치 여부가 바뀌면 갱신된다", () => {
    const media = stubMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery(QUERY));
    expect(result.current).toBe(false);

    media.change(true);

    expect(result.current).toBe(true);
  });

  it("언마운트하면 구독을 해제한다", () => {
    const media = stubMatchMedia(false);

    renderHook(() => useMediaQuery(QUERY)).unmount();

    expect(media.listenerCount).toBe(0);
  });
});
