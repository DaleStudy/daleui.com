import type { Link, Root, RootContent } from "mdast";
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from "mdast-util-mdx-jsx";
import { toString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const VIDEO_PATTERN = /\.(webm|mp4|mov|m4v|ogv)(\?|#|$)/i;

const VIDEO_BOOLEAN_ATTRS = [
  "autoPlay",
  "muted",
  "loop",
  "playsInline",
  "controls",
] as const;

function isVideoLink(node: Link): boolean {
  return VIDEO_PATTERN.test(node.url) || VIDEO_PATTERN.test(toString(node));
}

function buildAttributes(node: Link): MdxJsxAttribute[] {
  const attributes: MdxJsxAttribute[] = [
    { type: "mdxJsxAttribute", name: "src", value: node.url },
    ...VIDEO_BOOLEAN_ATTRS.map<MdxJsxAttribute>((name) => ({
      type: "mdxJsxAttribute",
      name,
      value: null,
    })),
  ];
  const label = toString(node).trim();
  if (label) {
    attributes.push({
      type: "mdxJsxAttribute",
      name: "aria-label",
      value: label,
    });
  }
  return attributes;
}

export const remarkVideoLink: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "paragraph", (paragraph, index, parent) => {
      if (
        parent &&
        index !== undefined &&
        paragraph.children.length === 1 &&
        paragraph.children[0].type === "link" &&
        isVideoLink(paragraph.children[0])
      ) {
        const flow: MdxJsxFlowElement = {
          type: "mdxJsxFlowElement",
          name: "video",
          attributes: buildAttributes(paragraph.children[0]),
          children: [],
        };
        (parent.children as RootContent[]).splice(index, 1, flow);
      }
    });

    visit(tree, "link", (node, index, parent) => {
      if (!parent || index === undefined || !isVideoLink(node)) return;
      const text: MdxJsxTextElement = {
        type: "mdxJsxTextElement",
        name: "video",
        attributes: buildAttributes(node),
        children: [],
      };
      parent.children.splice(index, 1, text);
    });
  };
};

export default remarkVideoLink;
