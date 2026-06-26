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
