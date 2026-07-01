import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "daleui/styles.css";
import "./index.css";
import { Navigation } from "./sections/common/Navigation";

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
        <Navigation />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
