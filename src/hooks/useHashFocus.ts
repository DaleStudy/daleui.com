import { useEffect } from "react";
import { useLocation } from "react-router";

function decodeHashId(hash: string) {
  const raw = hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    // 인코딩이 깨진 해시(`#%`)
    return raw;
  }
}

/** 해시가 가리키는 요소로 포커스를 옮겨, 다음 Tab이 링크 목록에 머물지 않게 합니다. */
export function useHashFocus() {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }
    const target = document.getElementById(decodeHashId(hash));
    if (!target) {
      return;
    }

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });

    const release = () => target.removeAttribute("tabindex");
    target.addEventListener("blur", release, { once: true });

    return () => {
      target.removeEventListener("blur", release);
      release();
    };
  }, [hash, key]);
}
