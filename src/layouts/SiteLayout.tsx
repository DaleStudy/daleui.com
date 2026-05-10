import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";

type SiteLayoutProps = {
  children: ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
