// giscus 댓글 위젯 설정값.
// 블로그 글은 DaleStudy/daleui "블로그" 카테고리 Discussion에서 오고 slug가 곧
// discussion 번호라, mapping=number로 글마다 원본 토론에 그대로 연결한다.
// repo-id·category-id는 공개돼도 되는 값이라 상수로 두되 VITE_GISCUS_* 로 덮어쓸 수 있다.
export const giscusConfig = {
  repo: (import.meta.env.VITE_GISCUS_REPO ??
    "DaleStudy/daleui") as `${string}/${string}`,
  repoId: import.meta.env.VITE_GISCUS_REPO_ID ?? "R_kgDOMovgOA",
  category: import.meta.env.VITE_GISCUS_CATEGORY ?? "블로그",
  categoryId: import.meta.env.VITE_GISCUS_CATEGORY_ID ?? "DIC_kwDOMovgOM4CqB1o",
} as const;

export const GISCUS_SCRIPT_SRC = "https://giscus.app/client.js";
export const GISCUS_ORIGIN = "https://giscus.app";

export type GiscusTheme = "light" | "dark";

/** client.js `<script>`에 붙일 `data-*` 속성. term은 글의 discussion 번호다. */
export function buildGiscusAttributes(
  theme: GiscusTheme,
  term: string,
): Record<string, string> {
  return {
    "data-repo": giscusConfig.repo,
    "data-repo-id": giscusConfig.repoId,
    "data-category": giscusConfig.category,
    "data-category-id": giscusConfig.categoryId,
    "data-mapping": "number",
    "data-term": term,
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "bottom",
    "data-theme": theme,
    "data-lang": "ko",
  };
}
