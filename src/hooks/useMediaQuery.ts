import { useMemo, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const store = useMemo(() => {
    let list: MediaQueryList | undefined;
    const get = () => (list ??= window.matchMedia(query));

    return {
      subscribe(listener: () => void) {
        const target = get();
        target.addEventListener("change", listener);
        return () => target.removeEventListener("change", listener);
      },
      getSnapshot: () => get().matches,
    };
  }, [query]);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => false);
}
