import { describe, expect, it } from "vitest";
import { buildGiscusAttributes, giscusConfig, pathnameToTerm } from "./giscus";

describe("buildGiscusAttributes", () => {
  it("설정 상수를 data 속성으로 전달한다", () => {
    const attrs = buildGiscusAttributes("light");

    expect(attrs["data-repo"]).toBe(giscusConfig.repo);
    expect(attrs["data-repo-id"]).toBe(giscusConfig.repoId);
    expect(attrs["data-category"]).toBe(giscusConfig.category);
    expect(attrs["data-category-id"]).toBe(giscusConfig.categoryId);
  });

  it("페이지-Discussion 매핑은 pathname 기준이다", () => {
    expect(buildGiscusAttributes("light")["data-mapping"]).toBe("pathname");
  });

  it("언어는 ko로 고정한다", () => {
    expect(buildGiscusAttributes("light")["data-lang"]).toBe("ko");
  });

  it("반응·입력 위치 등 고정 옵션을 설정한다", () => {
    const attrs = buildGiscusAttributes("light");

    expect(attrs["data-strict"]).toBe("0");
    expect(attrs["data-reactions-enabled"]).toBe("1");
    expect(attrs["data-emit-metadata"]).toBe("0");
    expect(attrs["data-input-position"]).toBe("bottom");
  });

  it("테마 인자를 data-theme에 반영한다", () => {
    expect(buildGiscusAttributes("light")["data-theme"]).toBe("light");
    expect(buildGiscusAttributes("dark")["data-theme"]).toBe("dark");
  });
});

describe("pathnameToTerm", () => {
  it("앞 슬래시를 떼어 term으로 쓴다", () => {
    expect(pathnameToTerm("/blog/my-post")).toBe("blog/my-post");
  });

  it("루트 경로는 index로 매핑한다", () => {
    expect(pathnameToTerm("/")).toBe("index");
  });

  it("확장자는 제거한다", () => {
    expect(pathnameToTerm("/blog/my-post.html")).toBe("blog/my-post");
  });
});
