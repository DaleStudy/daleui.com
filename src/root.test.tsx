import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { Link, RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import App, { Layout } from "./root";

// Meta·Links·Scripts 는 프레임워크 라우터 안에서만 렌더되므로 비워 둡니다.
vi.mock("react-router", async (original) => ({
  ...(await original<typeof import("react-router")>()),
  Meta: () => null,
  Links: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
}));

function Intro() {
  return (
    <p>
      코드 블록이 없는 문서 <Link to="/code">코드</Link>
    </p>
  );
}

/** Expressive Code 가 코드 블록 옆에 렌더하는 복사 버튼 구조입니다. */
function CodeBlock() {
  return (
    <div className="expressive-code">
      <figure className="frame">
        <pre>
          <code>const a = 1;</code>
        </pre>
        <div className="copy">
          <div aria-live="polite" />
          <button
            type="button"
            title="Copy to clipboard"
            data-copied="Copied!"
            data-code="const a = 1;"
          >
            <div />
          </button>
        </div>
      </figure>
    </div>
  );
}

function router(initial: string) {
  return createMemoryRouter(
    [
      {
        path: "/",
        Component: App,
        children: [
          { index: true, Component: Intro },
          { path: "code", Component: CodeBlock },
        ],
      },
    ],
    { initialEntries: [initial] },
  );
}

describe("App", () => {
  it("코드 블록이 없는 문서에서 이동해도 복사 버튼이 동작한다", async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router("/")} />);

    await user.click(await screen.findByRole("link", { name: "코드" }));
    const copy = await screen.findByTitle("Copy to clipboard");

    // 루트에서 복사 스크립트를 불러오는 동안 누른 클릭은 묻히므로 성공할 때까지 다시 누릅니다.
    await waitFor(async () => {
      await user.click(copy);
      expect(screen.queryByText("Copied!")).toBeInTheDocument();
    });

    expect(await navigator.clipboard.readText()).toBe("const a = 1;");
  });
});

describe("Layout", () => {
  it("본문보다 먼저 저장된 테마를 적용한다", () => {
    const html = renderToStaticMarkup(
      <Layout>
        <p>본문</p>
      </Layout>,
    );

    expect(html.indexOf("localStorage.getItem('theme')")).toBeLessThan(
      html.indexOf("본문"),
    );
  });
});
