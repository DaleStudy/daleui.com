import { compile } from "@mdx-js/mdx";
import rehypeExpressiveCode from "rehype-expressive-code";
import { describe, expect, it } from "vitest";
import {
  EXPRESSIVE_CODE_SCRIPTS_ID,
  expressiveCodeOptions,
  expressiveCodeScriptsPlugin,
  rehypeDropExpressiveCodeScripts,
} from "./expressive-code";

function hooks() {
  const plugin = expressiveCodeScriptsPlugin();

  return {
    resolveId: plugin.resolveId as unknown as (id: string) => string | null,
    load: plugin.load as unknown as (id: string) => Promise<string | null>,
  };
}

async function compileMdx(
  value: string,
  strip: boolean,
  path = "/repo/src/content/docs/button.mdx",
) {
  const file = await compile(
    { value, path },
    {
      rehypePlugins: [
        [rehypeExpressiveCode, expressiveCodeOptions],
        ...(strip ? [rehypeDropExpressiveCodeScripts] : []),
      ],
    },
  );

  return String(file);
}

const CODE_BLOCK = "```tsx\nconst a = 1;\n```\n";

describe("expressiveCodeScriptsPlugin", () => {
  it("가상 모듈 id만 해석한다", () => {
    const { resolveId } = hooks();

    expect(resolveId(EXPRESSIVE_CODE_SCRIPTS_ID)).toBe(
      `\0${EXPRESSIVE_CODE_SCRIPTS_ID}`,
    );
    expect(resolveId("react")).toBeNull();
  });

  it("복사 버튼 스크립트를 가상 모듈로 내보낸다", async () => {
    const { resolveId, load } = hooks();

    expect(await load("react")).toBeNull();

    const code = await load(resolveId(EXPRESSIVE_CODE_SCRIPTS_ID)!);

    expect(code).toContain(".expressive-code .copy button");
    expect(code).toContain("navigator.clipboard.writeText");
  });
});

describe("rehypeDropExpressiveCodeScripts", () => {
  it("코드 블록에 끼워 넣은 인라인 script를 걷어낸다", async () => {
    expect(await compileMdx(CODE_BLOCK, false)).toContain('_jsx("script"');

    const stripped = await compileMdx(CODE_BLOCK, true);

    expect(stripped).not.toContain('_jsx("script"');
    expect(stripped).toContain('"data-code": "const a = 1;"');
    expect(stripped).toContain('_jsx("style"');
  });

  it("블로그 Markdown의 인라인 script도 걷어낸다", async () => {
    const path = "/repo/src/content/blog/275.md";

    expect(await compileMdx(CODE_BLOCK, false, path)).toContain('"script"');
    expect(await compileMdx(CODE_BLOCK, true, path)).not.toContain('"script"');
  });

  it("코드 블록이 없는 문서는 그대로 둔다", async () => {
    const compiled = await compileMdx("# 소개\n", true);

    expect(compiled).toContain("소개");
  });
});
