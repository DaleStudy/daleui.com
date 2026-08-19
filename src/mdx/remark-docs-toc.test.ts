import type { Heading, Root } from "mdast";
import { describe, expect, it } from "vitest";
import { type RemarkDocsTocOptions, remarkDocsToc } from "./remark-docs-toc";

function heading(depth: 1 | 2 | 3 | 4, value: string): Heading {
  return { type: "heading", depth, children: [{ type: "text", value }] };
}

function transform(
  tree: Root,
  options?: RemarkDocsTocOptions,
  path?: string,
): Root {
  const plugin = remarkDocsToc as (
    options?: RemarkDocsTocOptions,
  ) => (tree: Root, file: { path?: string }) => void;
  plugin(options)(tree, { path });
  return tree;
}

function tocOf(tree: Root) {
  const last = tree.children.at(-1);
  if (last?.type !== "mdxjsEsm") {
    throw new Error("toc 내보내기가 없습니다");
  }
  return last;
}

function idOf(tree: Root, index: number) {
  return tree.children[index].data?.hProperties?.id;
}

describe("remarkDocsToc", () => {
  it("h2·h3에서 목차를 뽑아 toc로 내보낸다", () => {
    const tree = transform({
      type: "root",
      children: [heading(2, "시맨틱 토큰"), heading(3, "bg · 표면 배경")],
    });

    expect(tocOf(tree).value).toBe(
      `export const toc = ${JSON.stringify([
        { id: "시맨틱-토큰", label: "시맨틱 토큰", depth: 2 },
        { id: "bg--표면-배경", label: "bg · 표면 배경", depth: 3 },
      ])};`,
    );
  });

  it("목차와 같은 id를 heading에 붙인다", () => {
    const tree = transform({
      type: "root",
      children: [heading(2, "권장 사용처")],
    });

    expect(idOf(tree, 0)).toBe("권장-사용처");
  });

  it("같은 제목이 반복되면 id에 번호를 붙여 구분한다", () => {
    const tree = transform({
      type: "root",
      children: [heading(2, "개요"), heading(2, "개요")],
    });

    expect(tocOf(tree).value).toContain('"개요-1"');
  });

  it("h1과 h4는 목차에서 빼지만 id는 붙여 중복을 막는다", () => {
    const tree = transform({
      type: "root",
      children: [heading(2, "개요"), heading(4, "개요"), heading(1, "색상")],
    });

    expect(tocOf(tree).value).toBe(
      `export const toc = ${JSON.stringify([
        { id: "개요", label: "개요", depth: 2 },
      ])};`,
    );
    expect(idOf(tree, 1)).toBe("개요-1");
    expect(idOf(tree, 2)).toBe("색상");
  });

  it("include에 맞지 않는 파일은 건드리지 않는다", () => {
    const tree = transform(
      { type: "root", children: [heading(2, "개요")] },
      { include: /[\\/]docs[\\/]/ },
      "/repo/src/content/blog/275.md",
    );

    expect(tree.children).toHaveLength(1);
    expect(idOf(tree, 0)).toBeUndefined();
  });

  it("경로를 모르는 파일도 include가 있으면 건드리지 않는다", () => {
    const tree = transform(
      { type: "root", children: [heading(2, "개요")] },
      { include: /[\\/]docs[\\/]/ },
    );

    expect(tree.children).toHaveLength(1);
    expect(idOf(tree, 0)).toBeUndefined();
  });
});
