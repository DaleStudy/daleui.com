/**
 * 문서 사이드바 네비게이션 구조.
 *
 * depth 1: 카테고리(시작하기·파운데이션·컴포넌트·가이드)
 * depth 2: 그룹(선택) 또는 문서 항목
 * depth 3: 컴포넌트처럼 그룹으로 묶인 개별 문서 항목
 *
 * 2depth까지는 한국어, 3depth(컴포넌트 이름)만 영어를 사용합니다.
 */

/** 사이드바 최하위 문서 항목 */
export interface DocsNavItem {
  /** 라우트 경로에 사용되는 식별자 */
  id: string;
  /** 사이드바에 표시되는 라벨 */
  title: string;
}

/** 카테고리 하위 그룹. label이 있으면 3depth 그룹으로 렌더링합니다. */
export interface DocsNavGroup {
  label?: string;
  items: DocsNavItem[];
}

/** 사이드바 최상위 카테고리 */
export interface DocsNavCategory {
  title: string;
  groups: DocsNavGroup[];
}

export const DOCS_NAV: DocsNavCategory[] = [
  {
    title: "시작하기",
    groups: [
      {
        items: [
          { id: "intro", title: "소개" },
          { id: "install", title: "설치" },
          { id: "quickstart", title: "빠른 시작" },
        ],
      },
    ],
  },
  {
    title: "파운데이션",
    groups: [
      {
        items: [
          { id: "colors", title: "색상" },
          { id: "typography", title: "타이포그래피" },
          { id: "spacing", title: "스페이싱" },
          { id: "borders", title: "보더" },
          { id: "radii", title: "모서리 반경" },
          { id: "icons", title: "아이콘" },
        ],
      },
    ],
  },
  {
    title: "컴포넌트",
    groups: [
      {
        label: "레이아웃",
        items: [
          { id: "box", title: "Box" },
          { id: "flex", title: "Flex" },
          { id: "grid", title: "Grid" },
          { id: "hstack", title: "HStack" },
          { id: "vstack", title: "VStack" },
        ],
      },
      {
        label: "타이포그래피",
        items: [
          { id: "heading", title: "Heading" },
          { id: "text", title: "Text" },
        ],
      },
      {
        label: "폼",
        items: [
          { id: "checkbox", title: "Checkbox" },
          { id: "checkboxgroup", title: "CheckboxGroup" },
          { id: "label", title: "Label" },
          { id: "passwordinput", title: "PasswordInput" },
          { id: "radiogroup", title: "RadioGroup" },
          { id: "select", title: "Select" },
          { id: "textinput", title: "TextInput" },
        ],
      },
      {
        label: "일반",
        items: [
          { id: "button", title: "Button" },
          { id: "card", title: "Card" },
          { id: "icon", title: "Icon" },
          { id: "link", title: "Link" },
          { id: "tag", title: "Tag" },
        ],
      },
    ],
  },
  {
    title: "가이드",
    groups: [
      {
        items: [
          { id: "a11y-guide", title: "접근성" },
          { id: "form-patterns", title: "폼 패턴" },
          { id: "contributing", title: "기여하기" },
        ],
      },
    ],
  },
];

export interface DocsSearchEntry extends DocsNavItem {
  category: string;
  group?: string;
}

export const DOCS_SEARCH_INDEX: DocsSearchEntry[] = DOCS_NAV.flatMap((cat) =>
  cat.groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      category: cat.title,
      group: group.label,
    })),
  ),
);

/** 평탄화된 전체 문서 항목 목록 (이전/다음 탐색용) */
export const DOCS_FLAT_ITEMS: DocsNavItem[] = DOCS_SEARCH_INDEX;

const CATEGORY_BY_ID = new Map(
  DOCS_SEARCH_INDEX.map((entry) => [entry.id, entry.category]),
);

/** 제목이 검색어로 시작하는 항목을 우선 노출해 "but" → Button 이 먼저 보이게 합니다. */
export function searchDocs(query: string, limit = 8): DocsSearchEntry[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return [];
  }

  const score = (entry: DocsSearchEntry) => {
    const title = entry.title.toLowerCase();
    if (title === keyword) return 0;
    if (title.startsWith(keyword)) return 1;
    if (title.includes(keyword)) return 2;
    if (entry.id.includes(keyword)) return 3;
    return 4;
  };

  return DOCS_SEARCH_INDEX.map((entry) => ({ entry, score: score(entry) }))
    .filter(({ entry, score }) => {
      if (score < 4) return true;
      return [entry.category, entry.group].some((field) =>
        field?.toLowerCase().includes(keyword),
      );
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

/** 특정 문서 id가 속한 카테고리 제목을 반환합니다. */
export function findCategoryTitle(id: string): string | null {
  return CATEGORY_BY_ID.get(id) ?? null;
}
