import { MDXProvider } from "@mdx-js/react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { findDocsContent, listDocsContent } from "./loader";
import { DOCS_FLAT_ITEMS } from "../../sections/docs/docsNav";
import { docsComponents } from "../../sections/docs/foundations";

const entries = listDocsContent();

describe("문서 본문 모음", () => {
  it("사이드바에 등록된 문서 id만 사용한다", () => {
    const ids = DOCS_FLAT_ITEMS.map((item) => item.id);

    for (const [id] of entries) {
      expect(ids).toContain(id);
    }
  });

  it("파운데이션 카테고리의 모든 문서에 본문이 있다", () => {
    for (const id of [
      "colors",
      "typography",
      "spacing",
      "borders",
      "radii",
      "icons",
    ]) {
      expect(findDocsContent(id), `${id} 본문이 없습니다`).toBeDefined();
    }
  });

  it("본문이 없는 문서에는 undefined를 반환한다", () => {
    expect(findDocsContent("button")).toBeUndefined();
  });
});

describe.each(entries)("%s 문서", (id, doc) => {
  function renderDoc() {
    render(
      <MDXProvider components={docsComponents}>
        <doc.default />
      </MDXProvider>,
    );
  }

  it("목차 항목마다 같은 id의 heading이 있다", () => {
    renderDoc();

    expect(doc.toc.length).toBeGreaterThan(0);
    for (const item of doc.toc) {
      const heading = document.getElementById(item.id);
      expect(
        heading,
        `${id} 문서에 #${item.id} heading이 없습니다`,
      ).not.toBeNull();
      expect(heading?.tagName).toBe(`H${item.depth}`);
      expect(heading?.textContent).toContain(item.label);
    }
  });
});
