import type { Code, Root, RootContent } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { mdxjs } from "micromark-extension-mdxjs";
import type { Plugin } from "unified";
import { SKIP, visit } from "unist-util-visit";

export interface RemarkLiveDemoOptions {
  /** 이 정규식에 맞는 경로만 처리합니다. 없으면 모든 파일을 처리합니다. */
  include?: RegExp;
}

const PREVIEW_FLAG = /(?:^|\s)preview(?=\s|$)/;

/** 프리뷰는 MDX 모듈 안에서 그대로 렌더링되므로 top-level import·설명은 담을 수 없습니다. */
const JSX_NODES = new Set([
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxFlowExpression",
  "mdxTextExpression",
]);

function reject(path: string, type: string): never {
  throw new Error(
    `${path}: preview 코드 블록은 JSX만 담습니다 (${type}). import 문이나 설명은 일반 코드 블록에 써 주세요.`,
  );
}

/**
 * 코드 펜스 안의 JSX를 mdast 노드로 바꿉니다.
 * 한 줄로 쓴 JSX는 문단으로 파싱되므로, 문단은 걷어내고 JSX만 남깁니다.
 * 줄바꿈뿐인 공백은 JSX와 같은 규칙으로 버립니다.
 */
function parsePreview(code: Code, path: string): RootContent[] {
  const tree = fromMarkdown(code.value, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  });

  return tree.children.flatMap<RootContent>((node) => {
    if (JSX_NODES.has(node.type)) {
      return [node];
    }
    if (node.type !== "paragraph") {
      return reject(path, node.type);
    }

    return node.children.filter((child) => {
      if (JSX_NODES.has(child.type)) {
        return true;
      }
      if (child.type === "text" && child.value.trim() === "") {
        return !child.value.includes("\n");
      }
      return reject(path, child.type);
    });
  });
}

function slot(
  name: "preview" | "code",
  children: MdxJsxFlowElement["children"],
): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "LiveDemoSlot",
    attributes: [{ type: "mdxJsxAttribute", name: "name", value: name }],
    children,
  };
}

function liveDemo(code: Code, preview: RootContent[]): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "LiveDemo",
    attributes: [],
    children: [
      slot("preview", preview as MdxJsxFlowElement["children"]),
      slot("code", [code]),
    ],
  };
}

/**
 * `preview` 플래그가 붙은 코드 펜스를 라이브 데모로 바꿉니다.
 * 코드 펜스를 그대로 남겨 두므로 Expressive Code 하이라이팅이 유지되고,
 * 화면에 보이는 코드와 렌더링되는 결과가 같은 문자열에서 나옵니다.
 */
export const remarkLiveDemo: Plugin<[RemarkLiveDemoOptions?], Root> =
  ({ include } = {}) =>
  (tree, file) => {
    if (include && !include.test(file.path ?? "")) {
      return;
    }

    visit(tree, "code", (node, index, parent) => {
      if (!parent || index === undefined || !node.meta) {
        return;
      }
      if (!PREVIEW_FLAG.test(node.meta)) {
        return;
      }

      // Expressive Code가 모르는 플래그이므로 떼어 냅니다.
      node.meta = node.meta.replace(PREVIEW_FLAG, "").trim() || null;

      const demo = liveDemo(node, parsePreview(node, file.path ?? "문서"));
      (parent.children as RootContent[])[index] = demo;

      return SKIP;
    });
  };

export default remarkLiveDemo;
