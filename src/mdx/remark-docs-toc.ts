import { valueToEstree } from "estree-util-value-to-estree";
import GithubSlugger from "github-slugger";
import type { Root } from "mdast";
import type { MdxjsEsm } from "mdast-util-mdxjs-esm";
import { toString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export interface TocEntry {
  id: string;
  label: string;
  depth: 2 | 3;
}

export interface RemarkDocsTocOptions {
  /** 이 정규식에 맞는 경로만 처리합니다. 없으면 모든 파일을 처리합니다. */
  include?: RegExp;
}

/** 문서 본문에서 뽑은 목차를 MDX 모듈의 `toc` 내보내기로 만듭니다. */
function tocExport(toc: TocEntry[]): MdxjsEsm {
  return {
    type: "mdxjsEsm",
    value: `export const toc = ${JSON.stringify(toc)};`,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [],
            attributes: [],
            source: null,
            declaration: {
              type: "VariableDeclaration",
              kind: "const",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: { type: "Identifier", name: "toc" },
                  init: valueToEstree(toc),
                },
              ],
            },
          },
        ],
      },
    },
  };
}

/**
 * 모든 heading에 슬러그 id를 붙이고, h2·h3만 골라 `toc`로 내보냅니다.
 * 목차와 본문이 한 곳에서 나오므로 둘이 어긋날 수 없습니다.
 * id를 한 슬러거가 전부 매기므로 `rehype-slug`가 뒤늦게 같은 id를 만들 일도 없습니다.
 */
export const remarkDocsToc: Plugin<[RemarkDocsTocOptions?], Root> =
  ({ include } = {}) =>
  (tree, file) => {
    if (include && !include.test(file.path ?? "")) {
      return;
    }

    const slugger = new GithubSlugger();
    const toc: TocEntry[] = [];

    visit(tree, "heading", (node) => {
      const label = toString(node);
      const id = slugger.slug(label);
      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, id },
      };

      if (node.depth === 2 || node.depth === 3) {
        toc.push({ id, label, depth: node.depth });
      }
    });

    tree.children.push(tocExport(toc));
  };

export default remarkDocsToc;
