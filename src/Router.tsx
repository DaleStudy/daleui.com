import { SiteLayout } from "./layouts/SiteLayout";
import { MarketingPage } from "./pages/MarketingPage";

export function Router() {
  return (
    <SiteLayout>
      <MarketingPage />
    </SiteLayout>
  );
}
