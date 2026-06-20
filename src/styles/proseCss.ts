import { defineGlobalStyles } from "@pandacss/dev";

export const proseCss = defineGlobalStyles({
  ".prose": {
    color: "fg.neutral",
    fontSize: "var(--font-sizes-md)",
    lineHeight: "var(--line-heights-relaxed)",
    wordBreak: "keep-all",
    overflowWrap: "break-word",
  },
  ".prose > * + *": {
    marginTop: "16",
  },
  ".prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6": {
    paddingBottom: "8",
    borderBottom: "1px solid",
    borderColor: "border.neutral",
  },
  ".prose :is(h1, h2, h3, h4, h5, h6) > a[aria-hidden='true']": {
    marginLeft: "8",
    color: "fg.neutral.placeholder",
    textDecoration: "none",
    opacity: 0,
    transition: "opacity 0.15s ease-in-out",
  },
  ".prose :is(h1, h2, h3, h4, h5, h6) > a[aria-hidden='true']::before": {
    content: "'#'",
  },
  ".prose :is(h1, h2, h3, h4, h5, h6):hover > a[aria-hidden='true']": {
    opacity: 1,
  },
  ".prose :is(h1, h2, h3, h4, h5, h6) > a[aria-hidden='true']:focus-visible": {
    opacity: 1,
  },
  ".prose :is(h1, h2, h3, h4, h5, h6) > a[aria-hidden='true'] .icon-link": {
    display: "none",
  },
  ".prose h1": {
    marginTop: "24",
    textStyle: "heading.1",
  },
  ".prose h2": {
    marginTop: "24",
    textStyle: "heading.2",
  },
  ".prose h3": {
    marginTop: "16",
    textStyle: "heading.3",
  },
  ".prose h4": {
    marginTop: "16",
    textStyle: "heading.4",
  },
  ".prose h5": {
    marginTop: "8",
    textStyle: "heading.5",
  },
  ".prose p": {
    lineHeight: "var(--line-heights-relaxed)",
  },
  ".prose a": {
    color: "fg.brand",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  ".prose a:hover": {
    opacity: 0.85,
  },
  ".prose strong": {
    fontWeight: "var(--font-weights-bold)",
  },
  ".prose ul, .prose ol": {
    paddingLeft: "24",
  },
  ".prose ul": { listStyle: "disc" },
  ".prose ol": { listStyle: "decimal" },
  ".prose li + li": { marginTop: "2" },
  ".prose li > ul, .prose li > ol": { marginTop: "6" },
  ".prose ul.contains-task-list": {
    listStyle: "none",
    paddingLeft: "0",
  },
  ".prose li.task-list-item": {
    display: "flex",
    alignItems: "center",
    gap: "8",
  },
  ".prose blockquote": {
    borderLeft: "4px solid",
    borderColor: "border.neutral",
    color: "fg.neutral.placeholder",
    paddingLeft: "16",
    paddingY: "4",
    marginLeft: "0",
    fontStyle: "normal",
  },
  ".prose blockquote p": {
    color: "fg.neutral.placeholder",
  },
  ".prose hr": {
    border: "none",
    borderTop: "1px solid",
    borderColor: "border.neutral",
    marginY: "32",
  },
  ".prose img, .prose video": {
    display: "inline-block",
    maxWidth: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  ".prose table": {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "var(--font-sizes-sm)",
  },
  ".prose th, .prose td": {
    padding: "8",
    borderBottom: "1px solid",
    borderColor: "border.neutral",
    textAlign: "left",
  },
  ".prose th": {
    fontWeight: "var(--font-weights-bold)",
    backgroundColor: "bg.neutral.hover",
  },
  ".prose :not(pre) > code": {
    fontFamily: "var(--fonts-mono)",
    fontSize: "0.9em",
    padding: "2px 6px",
    borderRadius: "4px",
    backgroundColor: "bg.neutral.hover",
    color: "fg.neutral",
  },
});
