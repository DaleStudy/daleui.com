import { describe, expect, it } from "vitest";
import { giscusConfig } from "./giscus";

describe("giscusConfig", () => {
  it("repo·category 기본값을 노출한다", () => {
    expect(giscusConfig.repo).toBe("DaleStudy/daleui");
    expect(giscusConfig.category).toBe("블로그");
  });

  it("repo-id·category-id를 함께 노출한다", () => {
    expect(giscusConfig.repoId).toBeTruthy();
    expect(giscusConfig.categoryId).toBeTruthy();
  });
});
