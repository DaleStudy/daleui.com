import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "daleui/styles.css";
import "./index.css";
import { Navigation } from "./layouts/Navigation";
import { Footer } from "./layouts/Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navigation />
        {children}
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
