import { Icon } from "daleui";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { sva } from "../../../styled-system/css";
import { searchDocs } from "./docsNav";

/** 검색 UI는 `lg` 이상에서만 노출되므로(`DocsHeader.search`) 단축키도 같은 조건으로 제한합니다. */
const SEARCH_MEDIA_QUERY = "(min-width: 1024px)";

interface DocsSearchProps {
  /** 검색이 펼쳐진 상태인지 여부 */
  isOpen: boolean;
  /** 펼침 상태 변경 요청 */
  onOpenChange: (open: boolean) => void;
}

export function DocsSearch({ isOpen, onOpenChange }: DocsSearchProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const navigate = useNavigate();
  const listboxId = useId();
  const styles = docsSearch();

  const results = useMemo(() => searchDocs(query), [query]);
  const isPanelOpen = query.trim().length > 0;

  const reset = useCallback(() => {
    onOpenChange(false);
    setQuery("");
    setActiveIndex(0);
  }, [onOpenChange]);

  /** 문서 이동 없이 닫을 때는 트리거 버튼으로 포커스를 되돌립니다. */
  const dismiss = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    reset();
  }, [reset]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (!window.matchMedia(SEARCH_MEDIA_QUERY).matches) {
          return;
        }
        event.preventDefault();
        onOpenChange(true);
        return;
      }
      if (event.key === "Escape" && isOpen) {
        dismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, dismiss, onOpenChange]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      return;
    }
    if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  const goToDoc = (id: string) => {
    reset();
    navigate(`/docs/${id}`);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[activeIndex];
      if (item) {
        goToDoc(item.id);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(true)}
        aria-label="문서 검색 열기"
        className={styles.trigger}
      >
        <Icon name="search" size="sm" className={styles.triggerIcon} />
        <span className={styles.triggerLabel}>문서 검색…</span>
        <kbd className={styles.shortcut}>⌘K</kbd>
      </button>
    );
  }

  return (
    <>
      <div className={styles.wrap}>
        <Icon name="search" size="sm" className={styles.inputIcon} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="문서 검색…"
          role="combobox"
          aria-label="문서 검색"
          aria-expanded={isPanelOpen}
          aria-controls={results.length > 0 ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            results[activeIndex]
              ? `${listboxId}-${results[activeIndex].id}`
              : undefined
          }
          className={styles.input}
        />

        {isPanelOpen && (
          <div className={styles.panel}>
            {results.length === 0 ? (
              <p role="status" className={styles.empty}>
                검색 결과가 없습니다.
              </p>
            ) : (
              <ul
                id={listboxId}
                role="listbox"
                aria-label="문서 검색 결과"
                className={styles.list}
              >
                {results.map((item, index) => (
                  <li
                    key={item.id}
                    id={`${listboxId}-${item.id}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToDoc(item.id)}
                    className={styles.item}
                  >
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemMeta}>
                      {item.group
                        ? `${item.category} · ${item.group}`
                        : item.category}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div aria-hidden="true" onClick={dismiss} className={styles.overlay} />
    </>
  );
}

const docsSearch = sva({
  slots: [
    "trigger",
    "triggerIcon",
    "triggerLabel",
    "shortcut",
    "overlay",
    "wrap",
    "inputIcon",
    "input",
    "panel",
    "empty",
    "list",
    "item",
    "itemTitle",
    "itemMeta",
  ],
  base: {
    trigger: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8",
      width: "260px",
      height: "40px",
      flexShrink: 0,
      pl: "12",
      pr: "8",
      borderWidth: "1.5px",
      borderStyle: "solid",
      borderColor: "border.neutral",
      borderRadius: "sm",
      backgroundColor: "bg.neutral",
      cursor: "pointer",
      transition: "0.2s",
      _hover: {
        borderColor: "border.neutral.hover",
        backgroundColor: "bg.neutral.hover",
      },
    },
    triggerIcon: {
      flexShrink: 0,
      color: "fg.neutral.placeholder",
    },
    triggerLabel: {
      flex: 1,
      textAlign: "left",
      textStyle: "body.sm",
      color: "fg.neutral.placeholder",
    },
    shortcut: {
      display: "inline-flex",
      alignItems: "center",
      px: "8",
      py: "2",
      borderRadius: "sm",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.neutral",
      backgroundColor: "bg.neutral.hover",
      fontFamily: "mono",
      textStyle: "caption",
      color: "fg.neutral.placeholder",
    },
    overlay: {
      position: "fixed",
      inset: 0,
      zIndex: 40,
      cursor: "default",
    },
    wrap: {
      position: "relative",
      zIndex: 50,
      flexShrink: 0,
      width: { base: "260px", md: "440px" },
      transition: "width 0.25s ease",
    },
    inputIcon: {
      position: "absolute",
      left: "12",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "fg.neutral.placeholder",
      zIndex: 1,
    },
    input: {
      position: "relative",
      zIndex: 1,
      width: "100%",
      height: "40px",
      pl: "36",
      pr: "16",
      borderWidth: "1.5px",
      borderStyle: "solid",
      borderColor: "border.brand.focus",
      borderRadius: "sm",
      backgroundColor: "bg.neutral",
      color: "fg.neutral",
      textStyle: "body.sm",
      outline: "none",
    },
    panel: {
      position: "absolute",
      top: "calc(100% + 8px)",
      left: 0,
      right: 0,
      maxHeight: "min(420px, 60vh)",
      overflowY: "auto",
      py: "4",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.neutral",
      borderRadius: "md",
      backgroundColor: "appBg",
      boxShadow: "lg",
    },
    empty: {
      px: "16",
      py: "12",
      textStyle: "body.sm",
      color: "fg.neutral.placeholder",
    },
    list: {
      display: "flex",
      flexDirection: "column",
    },
    item: {
      display: "flex",
      flexDirection: "column",
      gap: "2",
      width: "100%",
      px: "16",
      py: "8",
      textAlign: "left",
      cursor: "pointer",
      _selected: { backgroundColor: "bg.neutral.hover" },
    },
    itemTitle: {
      textStyle: "label.md",
      color: "fg.neutral.active",
    },
    itemMeta: {
      textStyle: "caption",
      color: "fg.neutral.placeholder",
    },
  },
});
