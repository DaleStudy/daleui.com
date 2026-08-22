import type { MDXContent } from "mdx/types";
import type { TocItem } from "../../sections/docs/DocsToc";

const PREFIX = "./";

const EXT = /\.mdx$/;

export interface DocsContent {
  default: MDXContent;
  /** remarkDocsToc가 본문 heading에서 뽑아 준 목차 */
  toc: TocItem[];
}

const modules = import.meta.glob<DocsContent>("./**/*.mdx", { eager: true });

/** 사이드바 문서 id → MDX 본문 */
const docs = new Map(
  Object.entries(modules).map(([path, mod]) => [
    path.slice(PREFIX.length).replace(EXT, ""),
    mod,
  ]),
);

/** 본문이 준비된 문서를 반환합니다. 준비되지 않은 문서는 undefined입니다. */
export function findDocsContent(id: string): DocsContent | undefined {
  return docs.get(id);
}

export function listDocsContent(): [string, DocsContent][] {
  return [...docs];
}
