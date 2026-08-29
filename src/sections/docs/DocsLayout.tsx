import { Box, Icon, Link } from "daleui";
import { useEffect, useState } from "react";
import { css, sva } from "../../../styled-system/css";
import { DocsHeader } from "./DocsHeader";
import { DocsSidebar } from "./DocsSidebar";
import { DocsToc, type TocItem } from "./DocsToc";
import { DocsPagination } from "./DocsPagination";
import { findCategoryTitle } from "./docsNav";
import { useActiveTocId } from "../../hooks/useActiveTocId";
import { useHashFocus } from "../../hooks/useHashFocus";
import { getCopyrightYear } from "../../utils/getCopyrightYear";

const GITHUB_REPO_URL = "https://github.com/DaleStudy/daleui.com";

interface DocsLayoutProps {
  /** 현재 문서 id */
  currentId: string;
  /** 우측 목차 항목 */
  toc?: TocItem[];
  /**
   * GitHub 편집 링크가 가리킬 경로.
   * 지정하지 않으면 저장소 루트로 연결합니다.
   */
  editPath?: string;
  children: React.ReactNode;
}

export function DocsLayout({
  currentId,
  toc = [],
  editPath,
  children,
}: DocsLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pinnedTocId, setPinnedTocId] = useState<string>();
  const closeDrawer = () => setIsDrawerOpen(false);
  const styles = docsLayout();
  const scrolledTocId = useActiveTocId(
    toc.map((item) => item.id),
    HEADING_OFFSET,
  );
  // 부드럽게 이동하는 동안에는 중간 섹션을 훑지 않고 목적지를 활성으로 둡니다.
  const currentTocId = pinnedTocId ?? scrolledTocId;
  useHashFocus();

  const category = findCategoryTitle(currentId);
  const editUrl = editPath
    ? `${GITHUB_REPO_URL}/edit/main/${editPath}`
    : GITHUB_REPO_URL;

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.classList.add(...SCROLL_LOCK_CLASSES);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove(...SCROLL_LOCK_CLASSES);
    };
  }, [isDrawerOpen]);

  return (
    <>
      <DocsHeader
        isNavOpen={isDrawerOpen}
        onOpenNav={() => setIsDrawerOpen(true)}
      />

      <Box className={styles.root}>
        <Box as="aside" className={styles.sidebar}>
          <DocsSidebar currentId={currentId} />
        </Box>

        {isDrawerOpen && (
          <Box className={styles.drawerRoot} onClick={closeDrawer}>
            <Box className={styles.drawerScrim} />
            <Box
              as="aside"
              role="dialog"
              aria-modal="true"
              aria-label="문서 목차"
              onClick={(event) => event.stopPropagation()}
              className={styles.drawer}
            >
              <Box className={styles.drawerHeader}>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="문서 목차 닫기"
                  className={styles.drawerClose}
                >
                  <Icon name="x" size="md" />
                </button>
              </Box>
              <DocsSidebar currentId={currentId} onNavigate={closeDrawer} />
            </Box>
          </Box>
        )}

        <Box as="main" className={styles.main}>
          <Box className={styles.content}>
            {category && <Box className={styles.category}>{category}</Box>}

            {children}

            <Box as="footer" className={styles.footer}>
              <Link href={editUrl} external size="sm" className={styles.edit}>
                <Icon name="GitHub" size="sm" />
                GitHub에서 이 페이지 편집
              </Link>

              <DocsPagination currentId={currentId} />

              <Box className={styles.copyright}>
                © {getCopyrightYear()} 달레 스터디 · MIT License
              </Box>
            </Box>
          </Box>
        </Box>

        {toc.length > 0 && (
          <Box as="aside" className={styles.toc}>
            <DocsToc
              items={toc}
              activeId={currentTocId}
              onNavigateStart={setPinnedTocId}
              onNavigateEnd={(id) =>
                setPinnedTocId((current) =>
                  current === id ? undefined : current,
                )
              }
            />
          </Box>
        )}
      </Box>
    </>
  );
}

const SIDEBAR_WIDTH = "288px";
const TOC_WIDTH = "240px";
const HEADER_OFFSET = "64px";
const HEADING_OFFSET = 96;

/** 드로어가 열려 있는 동안 배경 스크롤을 막습니다. 드로어가 없는 `lg` 이상에서는 잠그지 않습니다. */
const SCROLL_LOCK_CLASSES = css({
  overflow: { base: "hidden", lg: "visible" },
}).split(" ");

const docsLayout = sva({
  slots: [
    "root",
    "sidebar",
    "drawerRoot",
    "drawerScrim",
    "drawer",
    "drawerHeader",
    "drawerClose",
    "main",
    "content",
    "category",
    "footer",
    "edit",
    "copyright",
    "toc",
  ],
  base: {
    root: {
      display: "flex",
      alignItems: "flex-start",
      width: "100%",
      maxWidth: "1480px",
      mx: "auto",
    },
    sidebar: {
      display: { base: "none", lg: "block" },
      width: SIDEBAR_WIDTH,
      flexShrink: 0,
      position: "sticky",
      top: HEADER_OFFSET,
      height: `calc(100vh - ${HEADER_OFFSET})`,
      overflowY: "auto",
      px: "16",
      pt: "20",
      pb: "64px",
      borderRightWidth: "1px",
      borderRightStyle: "solid",
      borderColor: "border.neutral",
    },
    drawerRoot: {
      display: { base: "block", lg: "none" },
    },
    drawerScrim: {
      position: "fixed",
      inset: 0,
      zIndex: 60,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    drawer: {
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 70,
      width: "80%",
      maxWidth: SIDEBAR_WIDTH,
      backgroundColor: "bg.neutral",
      overflowY: "auto",
      px: "16",
      pt: "20",
      pb: "64px",
      boxShadow: "lg",
    },
    drawerHeader: {
      display: "flex",
      justifyContent: "flex-end",
      mb: "8",
    },
    drawerClose: {
      padding: "8",
      cursor: "pointer",
    },
    main: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      justifyContent: "center",
      px: { base: "16", md: "56px" },
      pt: { base: "32", md: "52px" },
      pb: "80px",
    },
    content: {
      width: "100%",
      maxWidth: "768px",
      "& :where(h2, h3)": {
        scrollMarginTop: `${HEADING_OFFSET}px`,
      },
    },
    category: {
      textStyle: "caption",
      color: "fg.brand",
      mb: "8",
    },
    footer: {
      mt: "64px",
      pt: "24",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "border.neutral",
    },
    edit: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8",
      mb: "24",
    },
    copyright: {
      textStyle: "caption",
      color: "fg.neutral.placeholder",
      mt: "32",
    },
    toc: {
      display: { base: "none", xl: "block" },
      width: TOC_WIDTH,
      flexShrink: 0,
      position: "sticky",
      top: HEADER_OFFSET,
      height: `calc(100vh - ${HEADER_OFFSET})`,
      overflowY: "auto",
      px: "28px",
      pt: "56px",
      pb: "56px",
    },
  },
});
