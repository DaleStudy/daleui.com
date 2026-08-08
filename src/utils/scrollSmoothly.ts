const RESTORE_TIMEOUT = 1500;

let settlePending: (() => void) | undefined;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 스크롤이 끝날 때까지 문서에 `scroll-behavior: smooth`를 걸어 둔 채 이동합니다.
 * 해시 이동의 실제 스크롤은 react-router의 ScrollRestoration이 커밋 후에 수행하므로,
 * navigate가 끝난 뒤에도 스타일을 유지해야 부드럽게 움직입니다.
 */
export function scrollSmoothly(navigate: () => void, onSettled?: () => void) {
  settlePending?.();

  if (prefersReducedMotion()) {
    navigate();
    onSettled?.();
    return;
  }

  const html = document.documentElement;
  html.style.scrollBehavior = "smooth";
  navigate();

  const settle = () => {
    html.style.scrollBehavior = "";
    window.removeEventListener("scrollend", settle);
    clearTimeout(timer);
    settlePending = undefined;
    onSettled?.();
  };
  // scrollend를 지원하지 않는 브라우저와 스크롤이 일어나지 않는 경우의 상한입니다.
  const timer = setTimeout(settle, RESTORE_TIMEOUT);
  window.addEventListener("scrollend", settle);
  settlePending = settle;
}
