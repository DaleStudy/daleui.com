import { describe, expect, it } from "vitest";
import { listIconNames } from "./iconNames";

describe("listIconNames", () => {
  it("갤러리별 아이콘 이름을 돌려준다", () => {
    expect(listIconNames("interface")).toContain("search");
    expect(listIconNames("brand")).toContain("GitHub");
  });

  it("두 갤러리는 겹치지 않는다", () => {
    const brand = new Set<string>(listIconNames("brand"));

    expect(listIconNames("interface").some((name) => brand.has(name))).toBe(
      false,
    );
  });

  it("없는 갤러리를 요청하면 오류를 던진다", () => {
    expect(() => listIconNames("logo")).toThrowError(
      "logo 아이콘 갤러리가 없습니다",
    );
  });
});
