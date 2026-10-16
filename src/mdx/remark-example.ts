import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Code, Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import type { MdxjsEsm } from "mdast-util-mdxjs-esm";
import { mdxjs } from "micromark-extension-mdxjs";
import type { Plugin } from "unified";
import { SKIP, visit } from "unist-util-visit";

export interface RemarkExampleOptions {
  /** 이 정규식에 맞는 경로만 처리합니다. 없으면 모든 파일을 처리합니다. */
  include?: RegExp;
  /** 예제 파일을 찾을 디렉터리입니다. 기본값은 `<cwd>/src/examples`입니다. */
  examplesDir?: string;
}

/** 문서에 쓰는 태그와, 그 자리를 대신할 런타임 컴포넌트입니다. */
const TAG = "Example";
const TABS = "ExampleTabs";

function exampleName(node: MdxJsxFlowElement): unknown {
  const attribute = node.attributes.find(
    (candidate) =>
      candidate.type === "mdxJsxAttribute" && candidate.name === "name",
  );

  return attribute?.type === "mdxJsxAttribute" ? attribute.value : undefined;
}

function exampleFile(dir: string, name: string): string {
  return path.join(dir, `${name}.tsx`);
}

function readSource(file: string, label: string): string {
  if (!existsSync(file)) {
    throw new Error(`${label}: 예제 파일이 없습니다 (${file}).`);
  }

  return readFileSync(file, "utf8").trimEnd();
}

/** 문서에서 예제 모듈까지의 상대 경로입니다. */
function specifierFor(docPath: string, file: string): string {
  const relative = path
    .relative(path.dirname(docPath), file)
    .split(path.sep)
    .join("/");

  return relative.startsWith(".") ? relative : `./${relative}`;
}

/** 예제 이름은 식별자로 쓸 수 없는 글자를 담을 수 있으므로, 문서 안에서 겹치지 않는 이름을 새로 만듭니다. */
function localName(name: string, imports: Map<string, string>): string {
  const existing = imports.get(name);
  if (existing) {
    return existing;
  }

  const base = `_Example_${name.replace(/[^\p{L}\p{N}_$]+/gu, "_")}`;
  const taken = new Set(imports.values());
  let local = base;
  let suffix = 1;
  while (taken.has(local)) {
    suffix += 1;
    local = `${base}_${suffix}`;
  }

  imports.set(name, local);
  return local;
}

/** import 문의 estree는 손으로 짜기 번거로우므로 MDX 파서에 맡깁니다. */
function esmImport(local: string, specifier: string): MdxjsEsm {
  const tree = fromMarkdown(
    `import ${local} from ${JSON.stringify(specifier)};`,
    {
      extensions: [mdxjs()],
      mdastExtensions: [mdxFromMarkdown()],
    },
  );

  return tree.children[0] as MdxjsEsm;
}

function previewOf(local: string): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: local,
    attributes: [],
    children: [],
  };
}

function codeOf(source: string): Code {
  return { type: "code", lang: "tsx", value: source };
}

/**
 * `<Example name="button-basic" />`을 `src/examples/button-basic.tsx` 데모로 바꿉니다.
 * 프리뷰는 예제 모듈을 그대로 렌더링하고, 코드 탭은 같은 파일의 원문을 보여 줍니다.
 * 런타임에서 소스를 읽지 않고 빌드 타임에 코드 블록으로 심는 이유는, rehype 단계를 거쳐야
 * Expressive Code의 하이라이팅과 복사 버튼이 붙기 때문입니다.
 */
export const remarkExample: Plugin<[RemarkExampleOptions?], Root> =
  ({ include, examplesDir } = {}) =>
  (tree, file) => {
    if (include && !include.test(file.path ?? "")) {
      return;
    }

    const dir = examplesDir ?? path.join(process.cwd(), "src", "examples");
    const docPath = file.path ?? "";
    const label = file.path ?? "문서";
    const imports = new Map<string, string>();

    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name !== TAG) {
        return;
      }

      const name = exampleName(node);
      if (typeof name !== "string") {
        throw new Error(
          `${label}: <${TAG}>의 name은 문자열 리터럴이어야 합니다.`,
        );
      }

      const source = readSource(exampleFile(dir, name), label);

      node.name = TABS;
      node.attributes = [];
      node.children = [previewOf(localName(name, imports)), codeOf(source)];

      return SKIP;
    });

    tree.children.unshift(
      ...[...imports].map(([name, local]) =>
        esmImport(local, specifierFor(docPath, exampleFile(dir, name))),
      ),
    );
  };

export default remarkExample;
