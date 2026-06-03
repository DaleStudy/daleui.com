import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_CLASS = "dark";

function getResolvedTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains(DARK_CLASS)
    ? "dark"
    : "light";
}

function getServerTheme(): Theme {
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle(DARK_CLASS, theme === "dark");
}

function subscribe(notify: () => void): () => void {
  const root = document.documentElement;
  const classObserver = new MutationObserver(notify);
  classObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue === "dark" || event.newValue === "light") {
      applyTheme(event.newValue);
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    classObserver.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getResolvedTheme,
    getServerTheme,
  );

  const toggleTheme = useCallback(() => {
    const current = getResolvedTheme();
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  return {
    isDark: theme === "dark",
    toggleTheme,
  };
}
