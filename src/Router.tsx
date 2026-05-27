import { findBlog } from "./content/blog/loader";
import { SiteLayout } from "./layouts/SiteLayout";
import { BlogPage } from "./pages/BlogPage";
import { MarketingPage } from "./pages/MarketingPage";

export function Router() {
  const { pathname } = window.location;
  const blogPrefix = "/blog/";

  if (pathname.startsWith(blogPrefix)) {
    const slug = pathname.slice(blogPrefix.length).replace(/\/$/, "");
    const post = findBlog(slug);
    if (post) {
      return (
        <SiteLayout>
          <BlogPage post={post} />
        </SiteLayout>
      );
    }
  }

  return (
    <SiteLayout>
      <MarketingPage />
    </SiteLayout>
  );
}
