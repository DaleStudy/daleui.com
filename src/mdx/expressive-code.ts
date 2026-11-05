import type { Element, Root } from "hast";
import type { RehypeExpressiveCodeOptions } from "rehype-expressive-code";
import { createRenderer } from "rehype-expressive-code";
import { visit } from "unist-util-visit";
import type { Plugin } from "vite";

export const expressiveCodeOptions: RehypeExpressiveCodeOptions = {
  themes: ["github-light", "github-dark"],
};

export const EXPRESSIVE_CODE_SCRIPTS_ID = "virtual:expressive-code-scripts";

const RESOLVED_SCRIPTS_ID = `\0${EXPRESSIVE_CODE_SCRIPTS_ID}`;

/**
 * Expressive Code 는 복사 버튼과 스크롤 tabindex 스크립트를 코드 블록 옆 인라인
 * `<script type="module">` 로 넣습니다. 이 script 는 MDX 가 React 엘리먼트로
 * 컴파일되므로 클라이언트 사이드 이동으로 렌더된 경우 실행되지 않습니다.
 * 같은 스크립트를 앱 진입점에서 한 번 실행하도록 가상 모듈로 내보냅니다.
 */
export function expressiveCodeScriptsPlugin(): Plugin {
  let renderer: ReturnType<typeof createRenderer> | undefined;

  return {
    name: "expressive-code-scripts",
    resolveId(id) {
      return id === EXPRESSIVE_CODE_SCRIPTS_ID ? RESOLVED_SCRIPTS_ID : null;
    },
    async load(id) {
      if (id !== RESOLVED_SCRIPTS_ID) {
        return null;
      }

      renderer ??= createRenderer(expressiveCodeOptions);
      const { jsModules } = await renderer;

      return jsModules.join("\n");
    },
  };
}

function isExpressiveCodeGroup(node: Element) {
  const className = node.properties?.className;

  return Array.isArray(className) && className.includes("expressive-code");
}

function isScript(node: {
  type: string;
  tagName?: string;
  name?: string | null;
}) {
  return node.type === "element"
    ? node.tagName === "script"
    : node.type === "mdxJsxFlowElement" && node.name === "script";
}

/** 가상 모듈이 대신 실행하므로, 코드 블록에 끼워 넣은 인라인 script 는 걷어냅니다. */
export function rehypeDropExpressiveCodeScripts() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (!isExpressiveCodeGroup(node)) {
        return;
      }

      node.children = node.children.filter((child) => !isScript(child));
    });
  };
}
