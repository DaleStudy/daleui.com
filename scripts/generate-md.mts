/**
 * 페이지별 Markdown 원문 생성기.
 *
 * - 문서: `src/content/docs/*.mdx` → `public/docs/<slug>.md`
 * - 블로그: `src/content/blog/*.md(x)` → `public/blog/<slug>.md`
 *
 * MDX를 remark로 파싱해 JSX(ESM import/export, 표현식, 커스텀 컴포넌트)를
 * 걷어낸 순수 Markdown으로 변환합니다. 자식 Markdown(제목·문단·표·코드 등)은
 * 그대로 보존합니다. 산출물은 `public/` 아래 정적 자산으로 복사되어
 * `/docs/<slug>.md`, `/blog/<slug>.md`로 서빙됩니다. (사람용 HTML 페이지의
 * LLM·크롤러용 원문 버전)
 *
 * slug는 라우팅(`/docs/:slug`, `/blog/:slug`)과 동일하게 파일명에서 확장자를
 * 뺀 값을 사용하므로 수작업 없이 모든 페이지가 커버됩니다.
 *
 * 문서 MDX는 본문에 제목(H1)이 없고 라우트가 네비게이션의 title을 H1으로
 * 렌더하므로, 변환 결과 앞에 `# {title}`을 덧붙여 페이지와 맞춥니다.
 * 블로그 글은 frontmatter(title 등)를 그대로 보존합니다.
 *
 * (predev/prebuild에서 sync-blog 다음에 실행)
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Parent, Node } from "unist";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { SKIP, visit } from "unist-util-visit";
import { DOCS_FLAT_ITEMS } from "../src/sections/docs/docsNav.ts";

const ROOT = join(import.meta.dirname, "..");
const DOCS_DIR = join(ROOT, "src", "content", "docs");
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const OUT_DOCS = join(ROOT, "public", "docs");
const OUT_BLOG = join(ROOT, "public", "blog");

/** 통째로 제거할 MDX 노드 (import/export, 중괄호 표현식). */
const MDX_DROP = new Set([
  "mdxjsEsm",
  "mdxFlowExpression",
  "mdxTextExpression",
]);

/** 자식만 남기고 벗겨낼 MDX JSX 요소 (<Callout>, <SemanticColorTable /> 등). */
const MDX_UNWRAP = new Set(["mdxJsxFlowElement", "mdxJsxTextElement"]);

/**
 * MDX 전용 노드를 제거/해제해 순수 mdast로 만든다.
 * - import/export·표현식: 삭제
 * - JSX 요소: 자식 Markdown으로 교체(없으면 삭제)
 */
function stripMdx() {
  return (tree: Node) => {
    visit(
      tree,
      (node: Node, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || index === undefined) return;
        if (MDX_DROP.has(node.type)) {
          parent.children.splice(index, 1);
          return [SKIP, index];
        }
        if (MDX_UNWRAP.has(node.type)) {
          const children = (node as Parent).children ?? [];
          parent.children.splice(index, 1, ...children);
          // 교체 지점부터 다시 방문해 벗겨낸 자식을 이어서 처리한다.
          return [SKIP, index];
        }
      },
    );
  };
}

const stringifyOptions = {
  bullet: "-",
  fences: true,
  listItemIndent: "one",
  rule: "-",
} as const;

/** 문서용: MDX 파싱 후 JSX·import/export를 걷어낸다. */
const docsProcessor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkMdx)
  .use(remarkGfm)
  .use(stripMdx)
  .use(remarkStringify, stringifyOptions);

/**
 * 블로그용: 소스가 이미 순수 Markdown(GFM, raw HTML 포함)이므로
 * MDX 파서를 쓰지 않는다. (raw HTML을 JSX로 오인하지 않도록)
 */
const blogProcessor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkGfm)
  .use(remarkStringify, stringifyOptions);

async function toMarkdown(
  processor: typeof docsProcessor,
  source: string,
): Promise<string> {
  const file = await processor.process(source);
  return `${String(file).trim()}\n`;
}

/** 생성 디렉터리를 비우고 새로 만든다 (전부 생성물이라 통째로 교체). */
async function resetDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

async function generateDocs(): Promise<number> {
  const titleById = new Map(
    DOCS_FLAT_ITEMS.map((item) => [item.id, item.title]),
  );
  const files = (await readdir(DOCS_DIR)).filter((name) =>
    name.endsWith(".mdx"),
  );

  await resetDir(OUT_DOCS);
  await Promise.all(
    files.map(async (name) => {
      const slug = name.replace(/\.mdx$/, "");
      const raw = await readFile(join(DOCS_DIR, name), "utf8");
      const body = await toMarkdown(docsProcessor, raw);
      const title = titleById.get(slug);
      const md = title ? `# ${title}\n\n${body}` : body;
      await writeFile(join(OUT_DOCS, `${slug}.md`), md);
    }),
  );
  return files.length;
}

async function generateBlog(): Promise<number> {
  if (!existsSync(BLOG_DIR)) return 0;
  const files = (await readdir(BLOG_DIR)).filter((name) =>
    /\.mdx?$/.test(name),
  );

  await resetDir(OUT_BLOG);
  await Promise.all(
    files.map(async (name) => {
      const slug = name.replace(/\.mdx?$/, "");
      const raw = await readFile(join(BLOG_DIR, name), "utf8");
      const md = await toMarkdown(blogProcessor, raw);
      await writeFile(join(OUT_BLOG, `${slug}.md`), md);
    }),
  );
  return files.length;
}

async function main(): Promise<void> {
  const [docs, blog] = await Promise.all([generateDocs(), generateBlog()]);
  console.log(
    `[generate-md] 문서 ${docs}개, 블로그 ${blog}개의 Markdown 원문을 생성했습니다.`,
  );
}

main().catch((err) => {
  console.error("[generate-md] 실패:", err);
  process.exit(1);
});
