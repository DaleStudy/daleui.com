import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useTheme } from "../hooks/useTheme";
import {
  buildGiscusAttributes,
  giscusConfig,
  GISCUS_ORIGIN,
  GISCUS_SCRIPT_SRC,
  pathnameToTerm,
} from "../constants/giscus";

/**
 * giscus 기반 댓글 위젯.
 *
 * 글마다 재마운트하면(`key={slug}`) client.js가 매번 다시 실행돼 window의
 * message 리스너가 쌓인다. 그래서 한 번만 마운트하고, 글·테마 전환은 iframe에
 * `setConfig` 메시지를 보내 갱신한다.
 */
export function Giscus() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "light";
  const { pathname } = useLocation();

  // iframe load 시점에 최신 설정을 보내려고 ref로 들고 있는다.
  const config = { theme, term: pathnameToTerm(pathname) };
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (
      import.meta.env.DEV &&
      (!giscusConfig.repoId || !giscusConfig.categoryId)
    ) {
      console.warn(
        "[giscus] VITE_GISCUS_REPO_ID / VITE_GISCUS_CATEGORY_ID가 비어 있어 댓글 위젯이 로드되지 않습니다.",
      );
    }

    const sendConfig = () => {
      const iframe = container.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame",
      );
      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: configRef.current } },
        GISCUS_ORIGIN,
      );
    };

    // iframe은 client.js가 비동기로 만든다. 생성되면 load 시 현재 설정을 한 번 더
    // 보내, 로딩 중 테마·경로가 바뀌어 초기 postMessage가 유실돼도 맞춰지게 한다.
    const observer = new MutationObserver(() => {
      const iframe = container.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame",
      );
      if (!iframe) return;
      observer.disconnect();
      iframe.addEventListener("load", sendConfig);
    });
    observer.observe(container, { childList: true });

    const script = document.createElement("script");
    script.src = GISCUS_SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    for (const [name, value] of Object.entries(buildGiscusAttributes(theme))) {
      script.setAttribute(name, value);
    }
    container.appendChild(script);

    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
    // 마운트 시 1회만. theme·pathname 변경은 아래 effect가 처리한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 글·테마 전환 시 위젯을 갱신.
  useEffect(() => {
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme, term: pathnameToTerm(pathname) } } },
      GISCUS_ORIGIN,
    );
  }, [theme, pathname]);

  return <div ref={containerRef} className="giscus" />;
}
