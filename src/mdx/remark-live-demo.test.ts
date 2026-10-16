import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Root, RootContent } from "mdast";
import type {
  MdxJsxAttributeValueExpression,
  MdxJsxFlowElement,
} from "mdast-util-mdx-jsx";
import { visit } from "unist-util-visit";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type RemarkLiveDemoOptions, remarkLiveDemo } from "./remark-live-demo";

const SOURCE = `import { Button } from "daleui";

export default function ButtonBasic() {
  return <Button tone="brand">저장</Button>;
}
`;

/** 실제 저장소와 같은 배치를 임시 디렉터리에 만들어, 생성되는 import 경로까지 확인합니다. */
let root: string;
let examplesDir: string;
let docPath: string;

beforeAll(() => {
  root = mkdtempSync(path.join(tmpdir(), "daleui-"));
  examplesDir = path.join(root, "src", "examples");
  docPath = path.join(root, "src", "content", "docs", "button.mdx");
  mkdirSync(examplesDir, { recursive: true });
  mkdirSync(path.dirname(docPath), { recursive: true });
  writeFileSync(path.join(examplesDir, "button-basic.tsx"), SOURCE, "utf8");
  writeFileSync(path.join(examplesDir, "a-b.tsx"), "export default null;\n");
  writeFileSync(path.join(examplesDir, "a_b.tsx"), "export default null;\n");
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

/** `name`에 `null`을 주면 속성이 없는 `<Example />`이 됩니다. */
function example(
  name: string | MdxJsxAttributeValueExpression | null = "button-basic",
): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "Example",
    attributes:
      name === null
        ? []
        : [{ type: "mdxJsxAttribute", name: "name", value: name }],
    children: [],
  };
}

function transform(
  children: RootContent[],
  options?: RemarkLiveDemoOptions,
  file: { path?: string } = { path: docPath },
): Root {
  const tree: Root = { type: "root", children };
  const plugin = remarkLiveDemo as (
    options?: RemarkLiveDemoOptions,
  ) => (tree: Root, file: { path?: string }) => void;
  plugin({ examplesDir, ...options })(tree, file);
  return tree;
}

function demoOf(tree: Root): MdxJsxFlowElement {
  const node = tree.children.find(
    (child): child is MdxJsxFlowElement =>
      child.type === "mdxJsxFlowElement" && child.name === "LiveDemo",
  );
  if (!node) {
    throw new Error("LiveDemo로 바꾸지 않았습니다");
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

function importsOf(tree: Root): string[] {
  return tree.children
    .filter((child) => child.type === "mdxjsEsm")
    .map((child) => child.value);
}

describe("remarkLiveDemo", () => {
  it("Example 태그를 import와 LiveDemo 슬롯으로 바꾼다", () => {
    const tree = transform([example()]);

    expect(importsOf(tree)).toEqual([
      'import _Example_button_basic from "../../examples/button-basic.tsx";',
    ]);
    expect(
      demoOf(tree).children.map((child) =>
        child.type === "mdxJsxFlowElement"
          ? [child.name, nameOf(child)]
          : child.type,
      ),
    ).toEqual([
      ["LiveDemoSlot", "preview"],
      ["LiveDemoSlot", "code"],
    ]);
  });

  it("프리뷰 자리에 예제 컴포넌트를 자식 없이 렌더링한다", () => {
    const preview = slotOf(demoOf(transform([example()])), "preview");

    expect(preview.children).toEqual([
      {
        type: "mdxJsxFlowElement",
        name: "_Example_button_basic",
        attributes: [],
        children: [],
      },
    ]);
  });

  it("프리뷰를 마크다운으로 다시 파싱하지 않는다", () => {
    const types: string[] = [];

    visit(slotOf(demoOf(transform([example()])), "preview"), (node) => {
      types.push(node.type);
    });

    expect(types).not.toContain("paragraph");
    expect(types).not.toContain("text");
  });

  it("코드 탭에 예제 파일 원문을 그대로 넣는다", () => {
    const block = slotOf(demoOf(transform([example()])), "code").children[0];

    expect(block).toEqual({
      type: "code",
      lang: "tsx",
      value: SOURCE.trimEnd(),
    });
  });

  it("같은 예제를 여러 번 써도 import는 한 번만 넣는다", () => {
    const tree = transform([example(), example()]);

    expect(importsOf(tree)).toHaveLength(1);
  });

  it("식별자가 겹치는 이름끼리도 다른 import를 쓴다", () => {
    const tree = transform([example("a-b"), example("a_b")]);

    expect(importsOf(tree)).toEqual([
      'import _Example_a_b from "../../examples/a-b.tsx";',
      'import _Example_a_b_2 from "../../examples/a_b.tsx";',
    ]);
  });

  it("예제가 문서 아래에 있으면 상대 경로에 ./를 붙인다", () => {
    const tree = transform([example()], undefined, {
      path: path.join(root, "button.mdx"),
    });

    expect(importsOf(tree)).toEqual([
      'import _Example_button_basic from "./src/examples/button-basic.tsx";',
    ]);
  });

  it("예제 디렉터리를 주지 않으면 저장소의 src/examples를 읽는다", () => {
    const tree = transform(
      [example()],
      { examplesDir: undefined },
      { path: path.join(process.cwd(), "src/content/docs/button.mdx") },
    );

    expect(importsOf(tree)).toEqual([
      'import _Example_button_basic from "../../examples/button-basic.tsx";',
    ]);
    expect(slotOf(demoOf(tree), "code").children[0]).toMatchObject({
      value: readFileSync("src/examples/button-basic.tsx", "utf8").trimEnd(),
    });
  });

  it("Example이 아닌 JSX는 건드리지 않는다", () => {
    const gallery: MdxJsxFlowElement = {
      type: "mdxJsxFlowElement",
      name: "IconGallery",
      attributes: [],
      children: [],
    };

    const tree = transform([gallery]);

    expect(tree.children).toEqual([gallery]);
  });

  it("예제 파일이 없으면 문서 경로와 함께 빌드를 세운다", () => {
    expect(() => transform([example("없는-예제")])).toThrowError(
      /button\.mdx: 예제 파일이 없습니다 \(.*없는-예제\.tsx\)/,
    );
  });

  it("name이 문자열 리터럴이 아니면 빌드를 세운다", () => {
    expect(() =>
      transform([
        example({ type: "mdxJsxAttributeValueExpression", value: "name" }),
      ]),
    ).toThrowError(
      /button\.mdx: <Example>의 name은 문자열 리터럴이어야 합니다/,
    );
  });

  it("name이 없으면 빌드를 세운다", () => {
    expect(() => transform([example(null)])).toThrowError(
      /<Example>의 name은 문자열 리터럴이어야 합니다/,
    );
  });

  it("경로를 모르는 파일은 문서라고만 알려 준다", () => {
    expect(() => transform([example("없는-예제")], {}, {})).toThrowError(
      /^문서: 예제 파일이 없습니다/,
    );
  });

  it("include에 맞지 않는 파일은 건드리지 않는다", () => {
    const tree = transform(
      [example()],
      { include: /[\\/]docs[\\/]/ },
      {
        path: "/repo/src/content/blog/275.md",
      },
    );

    expect(tree.children).toEqual([example()]);
  });

  it("경로를 모르는 파일도 include가 있으면 건드리지 않는다", () => {
    const tree = transform([example()], { include: /[\\/]docs[\\/]/ }, {});

    expect(tree.children).toEqual([example()]);
  });
});
