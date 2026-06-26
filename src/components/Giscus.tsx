import { useEffect, useRef } from "react";
import { useTheme } from "../hooks/useTheme";
import {
  GISCUS_ORIGIN,
  GISCUS_SCRIPT_SRC,
  buildGiscusAttributes,
  giscusConfig,
} from "../constants/giscus";

interface GiscusProps {
  /** 댓글을 붙일 글의 discussion 번호(= slug). */
  term: string;
}

/**
 * giscus 댓글 위젯.
 *
 * 글마다 재마운트하면(key={slug}) client.js가 다시 실행되면서 window에 걸리는
 * message 리스너가 계속 쌓인다. 그래서 한 번만 마운트하고, 글·테마가 바뀌면
 * iframe에 setConfig 메시지를 보내 갱신한다.
 */
export function Giscus({ term }: GiscusProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "light";

  // iframe이 늦게 떴을 때 load 시점에 다시 보낼 최신 설정.
  const configRef = useRef({ theme, number: Number(term) });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (
      import.meta.env.DEV &&
      (!giscusConfig.repoId || !giscusConfig.categoryId)
    ) {
      console.warn(
        "[giscus] VITE_GISCUS_REPO_ID / VITE_GISCUS_CATEGORY_ID가 비어 있어 댓글 위젯이 뜨지 않습니다.",
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

    // client.js가 iframe을 비동기로 만든다. 만들어지면 load 때 현재 설정을 다시
    // 보내, 로딩 중에 테마나 글이 바뀌어도 어긋나지 않게 한다.
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
    for (const [name, value] of Object.entries(
      buildGiscusAttributes(theme, term),
    )) {
      script.setAttribute(name, value);
    }
    container.appendChild(script);

    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
    // 마운트 때 한 번만 실행한다. theme·term 변경은 아래 effect가 맡는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 글이나 테마가 바뀌면 위젯에 반영한다.
  useEffect(() => {
    const config = { theme, number: Number(term) };
    configRef.current = config;
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: config } },
      GISCUS_ORIGIN,
    );
  }, [theme, term]);

  return <div ref={containerRef} className="giscus" />;
}
