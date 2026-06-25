import { useEffect, useRef } from "react";
import { useTheme } from "../hooks/useTheme";
import {
  buildGiscusAttributes,
  GISCUS_ORIGIN,
  GISCUS_SCRIPT_SRC,
} from "../constants/giscus";

/**
 * giscus 기반 댓글 위젯.
 *
 * SPA(React Router 7) 환경이므로 `<script>`를 정적으로 삽입하지 않고 `useEffect`에서
 * 동적으로 주입한다. 페이지-Discussion 매핑은 `pathname` 기준이므로, 글마다 다른
 * Discussion에 매핑되도록 호출부에서 `key={slug}`로 글 전환 시 재마운트한다.
 *
 * 다크모드는 {@link useTheme}의 `isDark`와 연동한다. 최초 로드 시에는 `data-theme`로,
 * 이후 테마 토글 시에는 iframe에 `setConfig` 메시지를 보내 실시간으로 동기화한다.
 */
export function Giscus() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "light";

  // 최초 1회 client.js 주입. data-theme에는 마운트 시점의 테마를 그대로 싣는다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // StrictMode 이중 호출 등으로 중복 주입되지 않도록 가드.
    if (container.querySelector("script, iframe.giscus-frame")) return;

    const script = document.createElement("script");
    script.src = GISCUS_SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    for (const [name, value] of Object.entries(buildGiscusAttributes(theme))) {
      script.setAttribute(name, value);
    }

    container.appendChild(script);
    // 마운트 시 1회만 주입한다(theme 변경은 아래 effect가 postMessage로 처리).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테마 토글 시 iframe 설정을 실시간으로 갱신.
  useEffect(() => {
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      GISCUS_ORIGIN,
    );
  }, [theme]);

  return <div ref={containerRef} className="giscus" />;
}
