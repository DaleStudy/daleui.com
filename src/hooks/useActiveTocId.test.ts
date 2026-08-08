import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useActiveTocId } from "./useActiveTocId";

const OFFSET = 96;

const IDS = ["overview", "usage", "props"];

/** top 좌표를 호출 시점의 tops에서 읽으므로, tops를 바꾸면 스크롤 상황을 재현할 수 있습니다. */
function renderHeadings(tops: Record<string, number>) {
  for (const id of Object.keys(tops)) {
    const heading = document.createElement("h2");
    heading.id = id;
    heading.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect;
    document.body.appendChild(heading);
  }
}

function setViewport({
  scrollY,
  innerHeight = 800,
  scrollHeight = 5000,
}: {
  scrollY: number;
  innerHeight?: number;
  scrollHeight?: number;
}) {
  vi.spyOn(window, "scrollY", "get").mockReturnValue(scrollY);
  vi.spyOn(window, "innerHeight", "get").mockReturnValue(innerHeight);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(
    scrollHeight,
  );
}

/** happy-dom은 getBoundingClientRect를 갈아끼워도 리사이즈로 보지 않습니다. */
function stubResizeObserver() {
  const callbacks: ResizeObserverCallback[] = [];

  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  return {
    trigger() {
      for (const callback of callbacks) {
        callback([], {} as ResizeObserver);
      }
    },
  };
}

async function flushFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useActiveTocId", () => {
  it("목차가 비어 있으면 활성 항목이 없다", () => {
    const { result } = renderHook(() => useActiveTocId([], OFFSET));

    expect(result.current).toBeUndefined();
  });

  it("대응하는 heading이 문서에 없으면 활성 항목이 없다", () => {
    setViewport({ scrollY: 0 });

    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));

    expect(result.current).toBeUndefined();
  });

  it("기준선을 지난 heading 중 마지막 항목을 활성으로 둔다", () => {
    renderHeadings({ overview: -400, usage: OFFSET - 1, props: 600 });
    setViewport({ scrollY: 500 });

    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));

    expect(result.current).toBe("usage");
  });

  it("앵커 정렬 직후의 서브픽셀 오차를 기준선 안으로 본다", () => {
    // 앵커로 이동하면 heading top이 scroll-margin-top보다 소수점만큼 큽니다.
    renderHeadings({ overview: -800, usage: -300, props: OFFSET + 0.1875 });
    setViewport({ scrollY: 1800 });

    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));

    expect(result.current).toBe("props");
  });

  it("넘긴 offset을 기준선으로 삼는다", () => {
    renderHeadings({ overview: -400, usage: 200, props: 900 });
    setViewport({ scrollY: 500 });

    const { result } = renderHook(() => useActiveTocId(IDS, 240));

    expect(result.current).toBe("usage");
  });

  it("아직 어떤 heading도 지나지 않았으면 첫 항목을 활성으로 둔다", () => {
    renderHeadings({ overview: 300, usage: 900, props: 1500 });
    setViewport({ scrollY: 0 });

    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));

    expect(result.current).toBe("overview");
  });

  it("문서 끝까지 스크롤하면 마지막 항목을 활성으로 둔다", () => {
    renderHeadings({ overview: -900, usage: -400, props: 700 });
    setViewport({ scrollY: 4200, innerHeight: 800, scrollHeight: 5000 });

    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));

    expect(result.current).toBe("props");
  });

  it("스크롤할 수 없는 짧은 문서에서는 문서 끝 규칙을 적용하지 않는다", () => {
    renderHeadings({ overview: 300, usage: 500, props: 700 });
    setViewport({ scrollY: 0, innerHeight: 800, scrollHeight: 800 });

    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));

    expect(result.current).toBe("overview");
  });

  it("heading이 본문과 함께 마운트되어도 구독 직후 판정한다", async () => {
    setViewport({ scrollY: 0 });

    // 첫 getSnapshot은 커밋 전에 실행되므로 그 시점에는 heading이 없습니다.
    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));
    expect(result.current).toBeUndefined();

    renderHeadings({ overview: 300, usage: 900, props: 1500 });
    await flushFrame();

    expect(result.current).toBe("overview");
  });

  it("스크롤하면 활성 항목이 갱신된다", async () => {
    const tops: Record<string, number> = {
      overview: 300,
      usage: 900,
      props: 1500,
    };
    renderHeadings(tops);
    setViewport({ scrollY: 0 });

    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));
    expect(result.current).toBe("overview");

    tops.overview = -600;
    tops.usage = 0;
    window.dispatchEvent(new Event("scroll"));
    await flushFrame();

    expect(result.current).toBe("usage");
  });

  it("스크롤이 여러 번 발생해도 프레임당 한 번만 판정한다", async () => {
    const tops: Record<string, number> = { overview: 0, usage: 900 };
    renderHeadings(tops);
    setViewport({ scrollY: 0 });
    renderHook(() => useActiveTocId(IDS, OFFSET));
    await flushFrame();

    const spy = vi.spyOn(
      document.getElementById("overview")!,
      "getBoundingClientRect",
    );
    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new Event("scroll"));
    }
    await flushFrame();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("본문 크기가 바뀌면 활성 항목을 다시 판정한다", async () => {
    const observe = stubResizeObserver();
    const tops: Record<string, number> = {
      overview: 300,
      usage: 900,
      props: 1500,
    };
    renderHeadings(tops);
    setViewport({ scrollY: 0 });

    const { result } = renderHook(() => useActiveTocId(IDS, OFFSET));
    expect(result.current).toBe("overview");

    tops.overview = -1200;
    tops.usage = -400;
    tops.props = 0;
    observe.trigger();
    await flushFrame();

    expect(result.current).toBe("props");
  });

  it("구독이 끝나면 이벤트 리스너를 정리한다", () => {
    renderHeadings({ overview: 0 });
    setViewport({ scrollY: 0 });
    const remove = vi.spyOn(window, "removeEventListener");

    renderHook(() => useActiveTocId(IDS, OFFSET)).unmount();

    const removed = remove.mock.calls.map(([type]) => type);
    expect(removed).toContain("scroll");
    expect(removed).toContain("resize");
  });
});
