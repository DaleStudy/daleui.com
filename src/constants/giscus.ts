// giscus 댓글 위젯 설정값. 모두 공개돼도 되는 값이라 그대로 하드코딩한다.
// 블로그 글은 DaleStudy/daleui "블로그" 카테고리 Discussion에서 오고 slug가 곧
// discussion 번호라, mapping=number로 글마다 원본 토론에 그대로 연결한다.
export const giscusConfig = {
  repo: "DaleStudy/daleui" as `${string}/${string}`,
  repoId: "R_kgDOMovgOA",
  category: "블로그",
  categoryId: "DIC_kwDOMovgOM4CqB1o",
} as const;
