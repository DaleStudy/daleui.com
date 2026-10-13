import type { Code, Root } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { describe, expect, it } from "vitest";
import { type RemarkLiveDemoOptions, remarkLiveDemo } from "./remark-live-demo";

function code(value: string, meta: string | null = "preview"): Code {
  return { type: "code", lang: "tsx", meta, value };
}

function transform(
  tree: Root,
  options?: RemarkLiveDemoOptions,
  path?: string,
): Root {
  const plugin = remarkLiveDemo as (
    options?: RemarkLiveDemoOptions,
  ) => (tree: Root, file: { path?: string }) => void;
  plugin(options)(tree, { path });
  return tree;
}

function demoOf(tree: Root): MdxJsxFlowElement {
  const node = tree.children[0];
  if (node.type !== "mdxJsxFlowElement") {
    throw new Error("LiveDemo로 감싸지 않았습니다");
  }
  return node;
}

function nameOf(node: MdxJsxFlowElement): string | null {
  const attribute = node.attributes.find(
    (attr) => attr.type === "mdxJsxAttribute" && attr.name === "name",
  );
  return typeof attribute?.value === "string" ? attribute.value : null;
}

function slotOf(demo: MdxJsxFlowElement, name: string): MdxJsxFlowElement {
  const slot = demo.children.find(
    (child): child is MdxJsxFlowElement =>
      child.type === "mdxJsxFlowElement" &&
      child.name === "LiveDemoSlot" &&
      nameOf(child) === name,
  );
  if (!slot) {
    throw new Error(`${name} 슬롯이 없습니다`);
  }
  return slot;
}

describe("remarkLiveDemo", () => {
  it("preview 플래그가 붙은 코드 펜스를 LiveDemo로 감싼다", () => {
    const tree = transform({
      type: "root",
      children: [code('<Button tone="brand">저장</Button>')],
    });

    const demo = demoOf(tree);

    expect(demo.name).toBe("LiveDemo");
    expect(
      demo.children.map((child) =>
        child.type === "mdxJsxFlowElement"
          ? [child.name, nameOf(child)]
          : child.type,
      ),
    ).toEqual([
      ["LiveDemoSlot", "preview"],
      ["LiveDemoSlot", "code"],
    ]);
  });

  it("코드 문자열을 파싱해 프리뷰 JSX로 넣는다", () => {
    const tree = transform({
      type: "root",
      children: [code('<Button tone="brand">저장</Button>')],
    });

    const preview = slotOf(demoOf(tree), "preview");

    expect(preview.children).toHaveLength(1);
    expect(preview.children[0]).toMatchObject({
      type: "mdxJsxTextElement",
      name: "Button",
    });
  });

  it("여러 줄로 쓴 JSX와 줄바꿈 공백을 함께 처리한다", () => {
    const tree = transform({
      type: "root",
      children: [code("<Button>저장</Button>\n<Button>취소</Button>")],
    });

    const preview = slotOf(demoOf(tree), "preview");

    expect(preview.children.map((child) => child.type)).toEqual([
      "mdxJsxTextElement",
      "mdxJsxTextElement",
    ]);
  });

  it("JSX 사이의 한 줄 공백은 남긴다", () => {
    const tree = transform({
      type: "root",
      children: [code("<Tag>a</Tag> <Tag>b</Tag>")],
    });

    const preview = slotOf(demoOf(tree), "preview");

    expect(preview.children.map((child) => child.type)).toEqual([
      "mdxJsxTextElement",
      "text",
      "mdxJsxTextElement",
    ]);
  });

  it("원본 코드 펜스를 그대로 남겨 하이라이팅을 유지한다", () => {
    const tree = transform({
      type: "root",
      children: [code("<Button />")],
    });

    const block = slotOf(demoOf(tree), "code").children[0];

    expect(block).toMatchObject({
      type: "code",
      lang: "tsx",
      value: "<Button />",
    });
  });

  it("Expressive Code가 모르는 preview 플래그만 떼고 나머지 meta는 남긴다", () => {
    const tree = transform({
      type: "root",
      children: [code("<Button />", 'preview title="src/App.tsx"')],
    });

    const block = slotOf(demoOf(tree), "code").children[0];

    expect(block).toMatchObject({ meta: 'title="src/App.tsx"' });
  });

  it("meta가 preview뿐이면 meta를 비운다", () => {
    const tree = transform({
      type: "root",
      children: [code("<Button />")],
    });

    const block = slotOf(demoOf(tree), "code").children[0];

    expect(block).toMatchObject({ meta: null });
  });

  it("preview 플래그가 없는 코드 펜스는 건드리지 않는다", () => {
    const tree = transform({
      type: "root",
      children: [code("<Button />", null), code("<Button />", "title='a.tsx'")],
    });

    expect(tree.children.map((child) => child.type)).toEqual(["code", "code"]);
  });

  it("import 문이 섞이면 오류로 알려 준다", () => {
    expect(() =>
      transform({
        type: "root",
        children: [code('import { Button } from "daleui";\n\n<Button />')],
      }),
    ).toThrowError(/preview 코드 블록은 JSX만 담습니다 \(mdxjsEsm\)/);
  });

  it("JSX 옆에 설명이 섞이면 오류로 알려 준다", () => {
    expect(() =>
      transform({
        type: "root",
        children: [code("저장 버튼 <Button />")],
      }),
    ).toThrowError(/preview 코드 블록은 JSX만 담습니다 \(text\)/);
  });

  it("include에 맞지 않는 파일은 건드리지 않는다", () => {
    const tree = transform(
      { type: "root", children: [code("<Button />")] },
      { include: /[\\/]docs[\\/]/ },
      "/repo/src/content/blog/275.md",
    );

    expect(tree.children[0]).toMatchObject({ type: "code", meta: "preview" });
  });

  it("경로를 모르는 파일도 include가 있으면 건드리지 않는다", () => {
    const tree = transform(
      { type: "root", children: [code("<Button />")] },
      { include: /[\\/]docs[\\/]/ },
    );

    expect(tree.children[0]).toMatchObject({ type: "code" });
  });
});
