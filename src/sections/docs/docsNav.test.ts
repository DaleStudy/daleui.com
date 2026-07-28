import { describe, expect, it } from "vitest";
import {
  DOCS_FLAT_ITEMS,
  DOCS_NAV,
  DOCS_SEARCH_INDEX,
  findCategoryTitle,
  searchDocs,
} from "./docsNav";

describe("DOCS_FLAT_ITEMS", () => {
  it("모든 카테고리·그룹의 항목을 순서대로 평탄화한다", () => {
    const expected = DOCS_NAV.flatMap((cat) =>
      cat.groups.flatMap((group) => group.items.map((item) => item.id)),
    );
    expect(DOCS_FLAT_ITEMS.map((item) => item.id)).toEqual(expected);
  });

  it("문서 id가 중복되지 않는다", () => {
    const ids = DOCS_FLAT_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("findCategoryTitle", () => {
  it("항목이 속한 카테고리 제목을 반환한다", () => {
    expect(findCategoryTitle("button")).toBe("컴포넌트");
    expect(findCategoryTitle("intro")).toBe("시작하기");
    expect(findCategoryTitle("colors")).toBe("파운데이션");
  });

  it("존재하지 않는 id에는 null을 반환한다", () => {
    expect(findCategoryTitle("unknown")).toBeNull();
  });
});

describe("DOCS_SEARCH_INDEX", () => {
  it("모든 문서에 카테고리를 채운다", () => {
    expect(DOCS_SEARCH_INDEX).toHaveLength(DOCS_FLAT_ITEMS.length);
    expect(DOCS_SEARCH_INDEX.every((entry) => entry.category.length > 0)).toBe(
      true,
    );
  });

  it("그룹이 있는 항목에는 그룹 라벨을 채운다", () => {
    const button = DOCS_SEARCH_INDEX.find((entry) => entry.id === "button");
    expect(button).toMatchObject({ category: "컴포넌트", group: "일반" });
  });
});

describe("searchDocs", () => {
  it("빈 검색어에는 결과를 반환하지 않는다", () => {
    expect(searchDocs("")).toEqual([]);
    expect(searchDocs("   ")).toEqual([]);
  });

  it("대소문자를 구분하지 않고 제목을 검색한다", () => {
    expect(searchDocs("BUT").map((item) => item.id)).toContain("button");
  });

  it("제목이 검색어로 시작하는 항목을 먼저 노출한다", () => {
    expect(searchDocs("box")[0].id).toBe("box");
    expect(searchDocs("checkbox")[0].id).toBe("checkbox");
  });

  it("카테고리·그룹 이름으로도 검색한다", () => {
    expect(searchDocs("파운데이션").map((item) => item.id)).toContain("colors");
    expect(searchDocs("폼").map((item) => item.id)).toContain("textinput");
  });

  it("일치하는 항목이 없으면 빈 배열을 반환한다", () => {
    expect(searchDocs("존재하지않는문서")).toEqual([]);
  });

  it("결과 개수를 limit으로 제한한다", () => {
    expect(searchDocs("컴포넌트", 3)).toHaveLength(3);
  });
});
