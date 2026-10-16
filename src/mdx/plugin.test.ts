import type { HmrContext, ViteDevServer } from "vite";
import { describe, expect, it } from "vitest";
import { mdxPlugin } from "./plugin";

interface Module {
  file: string;
}

function server(files: string[]) {
  const invalidated: string[] = [];
  const sent: string[] = [];
  const moduleGraph = {
    fileToModulesMap: new Map(
      files.map((file) => [file, new Set<Module>([{ file }])]),
    ),
    invalidateModule: (module: Module) => invalidated.push(module.file),
  };

  return {
    invalidated,
    sent,
    value: {
      environments: { client: { moduleGraph }, ssr: { moduleGraph } },
      hot: { send: (payload: { type: string }) => sent.push(payload.type) },
    } as unknown as ViteDevServer,
  };
}

function hotUpdate(file: string, target: ReturnType<typeof server>) {
  const handle = mdxPlugin().handleHotUpdate;
  handle({ file, server: target.value } as HmrContext);
}

describe("mdxPlugin", () => {
  it("예제 파일이 바뀌면 문서 MDX를 무효화하고 전체 리로드한다", () => {
    const target = server([
      "/repo/src/content/docs/button.mdx",
      "/repo/src/content/docs/loader.ts",
      "/repo/src/content/blog/275.md",
    ]);

    hotUpdate("/repo/src/examples/button-basic.tsx", target);

    expect(target.invalidated).toEqual([
      "/repo/src/content/docs/button.mdx",
      "/repo/src/content/docs/button.mdx",
    ]);
    expect(target.sent).toEqual(["full-reload"]);
  });

  it("예제 밖의 파일은 기본 HMR에 맡긴다", () => {
    const target = server(["/repo/src/content/docs/button.mdx"]);

    hotUpdate("/repo/src/sections/docs/LiveDemo.tsx", target);

    expect(target.invalidated).toEqual([]);
    expect(target.sent).toEqual([]);
  });
});
