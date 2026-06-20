import { UnderConstruction } from "../components/UnderConstruction";

// eslint-disable-next-line react-refresh/only-export-components
export function meta() {
  return [
    { title: "문서 | Dale UI" },
    {
      name: "description",
      content: "달레UI 문서 페이지입니다.",
    },
  ];
}

export default function DocsIndex() {
  return <UnderConstruction title="문서" />;
}
