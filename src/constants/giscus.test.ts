import { describe, expect, it } from "vitest";
import { buildGiscusAttributes, giscusConfig } from "./giscus";

describe("buildGiscusAttributes", () => {
  it("설정 상수를 data 속성으로 전달한다", () => {
    const attrs = buildGiscusAttributes("light", "682");

    expect(attrs["data-repo"]).toBe(giscusConfig.repo);
    expect(attrs["data-repo-id"]).toBe(giscusConfig.repoId);
    expect(attrs["data-category"]).toBe(giscusConfig.category);
    expect(attrs["data-category-id"]).toBe(giscusConfig.categoryId);
  });

  it("글의 discussion 번호로 매핑한다", () => {
    const attrs = buildGiscusAttributes("light", "682");

    expect(attrs["data-mapping"]).toBe("number");
    expect(attrs["data-term"]).toBe("682");
  });

  it("언어는 ko로 고정한다", () => {
    expect(buildGiscusAttributes("light", "1")["data-lang"]).toBe("ko");
  });

  it("반응·입력 위치 등 고정 옵션을 설정한다", () => {
    const attrs = buildGiscusAttributes("light", "1");

    expect(attrs["data-reactions-enabled"]).toBe("1");
    expect(attrs["data-emit-metadata"]).toBe("0");
    expect(attrs["data-input-position"]).toBe("bottom");
  });

  it("테마 인자를 data-theme에 반영한다", () => {
    expect(buildGiscusAttributes("light", "1")["data-theme"]).toBe("light");
    expect(buildGiscusAttributes("dark", "1")["data-theme"]).toBe("dark");
  });
});
