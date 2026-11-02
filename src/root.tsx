import { useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "daleui/styles.css";
import "./index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* FOUC를 방지 */}
        <script>
          {`
            (function () {
              try {
                var stored = localStorage.getItem('theme');
                var prefersDark = !stored && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || prefersDark) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          `}
        </script>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // 코드 블록 옆 인라인 script 는 클라이언트 사이드 이동에서 실행되지 않으므로,
  // Expressive Code 스크립트는 첫 페이지의 코드 블록 유무와 무관하게 여기서 한 번 실행합니다.
  useEffect(() => {
    void import("virtual:expressive-code-scripts");
  }, []);

  return <Outlet />;
}
