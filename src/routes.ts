import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/marketing.layout.tsx", [
    index("routes/home.tsx"),
    route("showcase", "routes/showcase._index.tsx"),
    route("blog", "routes/blog._index.tsx"),
    route("blog/:slug", "routes/blog.$slug.tsx"),
  ]),
  route("docs", "routes/docs._index.tsx"),
] satisfies RouteConfig;
