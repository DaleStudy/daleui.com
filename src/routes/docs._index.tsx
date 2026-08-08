import { Navigate } from "react-router";
import { DOCS_FLAT_ITEMS } from "../sections/docs/docsNav";

/**
 * 문서 인덱스는 첫 번째 문서(소개)로 리다이렉트합니다.
 */
export default function DocsIndex() {
  return <Navigate to={`/docs/${DOCS_FLAT_ITEMS[0].id}`} replace />;
}
