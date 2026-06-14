import { describe, expect, it } from "vitest";
import { createCollection } from "./createCollection";
import type { MdxModule } from "./types";

type Frontmatter = { title: string; date: string };

const Component = () => null;

const modules: Record<string, MdxModule<Frontmatter>> = {
  "./first.mdx": {
    default: Component,
    frontmatter: { title: "First", date: "2026-01-01" },
  },
  "./second.mdx": {
    default: Component,
    frontmatter: { title: "Second", date: "2026-02-01" },
  },
};

const PREFIX = "./";

describe("createCollection", () => {
  it("경로에서 슬러그를 추출한다", () => {
    const { list } = createCollection(modules, PREFIX);
    expect(list().map((item) => item.slug)).toEqual(["first", "second"]);
  });

  it("정렬 함수를 적용한다", () => {
    const { list } = createCollection(modules, PREFIX, (a, b) =>
      b.frontmatter.date.localeCompare(a.frontmatter.date),
    );
    expect(list().map((item) => item.slug)).toEqual(["second", "first"]);
  });

  it("슬러그로 문서를 찾는다", () => {
    const { find } = createCollection(modules, PREFIX);
    expect(find("first")?.frontmatter.title).toBe("First");
  });

  it("존재하지 않는 슬러그는 undefined를 반환한다", () => {
    const { find } = createCollection(modules, PREFIX);
    expect(find("missing")).toBeUndefined();
  });

  it(".md 확장자(Discussions 동기화 글)에서도 슬러그를 추출한다", () => {
    const mdModules: Record<string, MdxModule<Frontmatter>> = {
      "./987.md": {
        default: Component,
        frontmatter: { title: "Discussion", date: "2026-03-01" },
      },
    };
    const { list, find } = createCollection(mdModules, PREFIX);
    expect(list().map((item) => item.slug)).toEqual(["987"]);
    expect(find("987")?.frontmatter.title).toBe("Discussion");
  });
});
