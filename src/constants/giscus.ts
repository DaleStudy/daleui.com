// giscus 댓글 위젯 설정값.
// repo-id·category-id는 GitHub Discussions 백엔드라 공개돼도 무방하다.
// 값 발급: https://giscus.app/ko · 빌드 시 VITE_GISCUS_* 로 덮어쓸 수 있다.
export const giscusConfig = {
  repo: (import.meta.env.VITE_GISCUS_REPO ??
    "DaleStudy/daleui.com") as `${string}/${string}`,
  repoId: import.meta.env.VITE_GISCUS_REPO_ID ?? "",
  category: import.meta.env.VITE_GISCUS_CATEGORY ?? "Comments",
  categoryId: import.meta.env.VITE_GISCUS_CATEGORY_ID ?? "",
} as const;

export const GISCUS_SCRIPT_SRC = "https://giscus.app/client.js";
export const GISCUS_ORIGIN = "https://giscus.app";

export type GiscusTheme = "light" | "dark";

/**
 * `mapping="pathname"`일 때 giscus가 Discussion을 찾는 term을 만든다.
 * client.js의 계산식과 동일해야 SPA 이동 후 setConfig로도 같은 글을 가리킨다.
 */
export function pathnameToTerm(pathname: string): string {
  return pathname.length < 2
    ? "index"
    : pathname.substring(1).replace(/\.\w+$/, "");
}

/** client.js `<script>`에 실을 `data-*` 속성 맵. 순수 함수라 단위 테스트 가능. */
export function buildGiscusAttributes(
  theme: GiscusTheme,
): Record<string, string> {
  return {
    "data-repo": giscusConfig.repo,
    "data-repo-id": giscusConfig.repoId,
    "data-category": giscusConfig.category,
    "data-category-id": giscusConfig.categoryId,
    "data-mapping": "pathname",
    "data-strict": "0",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "bottom",
    "data-theme": theme,
    "data-lang": "ko",
  };
}
