import { Outlet } from "react-router";
import { Navigation } from "../sections/common/Navigation";

/** 문서 페이지는 자체 헤더(`DocsHeader`)를 쓰므로 `Navigation`을 이 레이아웃에만 둡니다. */
export default function MarketingLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}
