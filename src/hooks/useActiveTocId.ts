import { useMemo, useSyncExternalStore } from "react";

const TOLERANCE = 2;
const ID_SEPARATOR = "\n";

function findActiveId(ids: string[], offset: number): string | undefined {
  const headings = ids
    .map((id) => document.getElementById(id))
    .filter((element): element is HTMLElement => element !== null);

  if (headings.length === 0) {
    return undefined;
  }

  // 마지막 섹션이 짧으면 기준선에 닿지 못하므로, 문서 끝에서는 마지막 항목을 활성으로 둡니다.
  // 스크롤할 수 없는 짧은 문서는 언제나 문서 끝이어서 이 규칙에서 제외합니다.
  const { scrollHeight } = document.documentElement;
  const isScrollable = scrollHeight > window.innerHeight + TOLERANCE;
  if (
    isScrollable &&
    window.innerHeight + window.scrollY >= scrollHeight - TOLERANCE
  ) {
    return headings[headings.length - 1].id;
  }

  const passed = headings.filter(
    (heading) => heading.getBoundingClientRect().top <= offset + TOLERANCE,
  );
  return (passed[passed.length - 1] ?? headings[0]).id;
}

function createActiveIdStore(ids: string[], offset: number) {
  const listeners = new Set<() => void>();
  let snapshot: string | undefined;
  let hasSnapshot = false;
  let frame = 0;
  let observer: ResizeObserver | undefined;

  const update = () => {
    frame = 0;
    const next = findActiveId(ids, offset);
    hasSnapshot = true;
    if (next === snapshot) {
      return;
    }
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const schedule = () => {
    frame ||= requestAnimationFrame(update);
  };

  return {
    subscribe(listener: () => void) {
      if (ids.length === 0) {
        return () => {};
      }

      listeners.add(listener);

      if (listeners.size === 1) {
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        // 이미지·폰트 로딩으로 heading 위치가 밀리는 경우도 반영합니다.
        observer = new ResizeObserver(schedule);
        observer.observe(document.body);
        // 첫 getSnapshot은 heading이 커밋되기 전에 실행되므로 구독 직후 다시 판정합니다.
        schedule();
      }

      return () => {
        listeners.delete(listener);
        if (listeners.size > 0) {
          return;
        }
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        observer?.disconnect();
        observer = undefined;
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      };
    },

    getSnapshot() {
      if (!hasSnapshot) {
        snapshot = findActiveId(ids, offset);
        hasSnapshot = true;
      }
      return snapshot;
    },
  };
}

/**
 * 스크롤 위치에 대응하는 목차 항목 id를 반환합니다.
 *
 * IntersectionObserver 대신 위치를 직접 계산합니다. 화면보다 긴 섹션은
 * 어떤 heading도 교차하지 않아 활성 항목이 비는 구간이 생기기 때문입니다.
 *
 * @param ids 목차가 가리키는 heading id 목록
 * @param offset 활성 판정 기준선. heading의 scroll-margin-top과 같은 값을 넘겨야
 * 목차 링크로 이동한 직후 활성 항목이 어긋나지 않습니다.
 */
export function useActiveTocId(
  ids: string[],
  offset: number,
): string | undefined {
  const idsKey = ids.join(ID_SEPARATOR);

  const store = useMemo(
    () => createActiveIdStore(idsKey ? idsKey.split(ID_SEPARATOR) : [], offset),
    [idsKey, offset],
  );

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => undefined,
  );
}
