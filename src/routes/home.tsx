import { useCallback, useEffect } from "react";
import { Community } from "../sections/marketing/Community";
import { Contribution } from "../sections/marketing/Contribution";
import { Header } from "../sections/marketing/Header";
import { How } from "../sections/marketing/How";
import { Mission } from "../sections/marketing/Mission";
import { Team } from "../sections/marketing/Team";

// eslint-disable-next-line react-refresh/only-export-components
export function meta() {
  return [{ title: "Dale UI" }];
}

export default function Home() {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const setHashNavigation = useCallback(
    (sectionId: string) => {
      window.history.pushState(null, "", `#${sectionId}`);
      scrollToSection(sectionId);
    },
    [scrollToSection],
  );

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) {
        return;
      }
      const sectionId = hash.slice(1);
      scrollToSection(sectionId);
    };

    requestAnimationFrame(() => {
      handleHashChange();
    });

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [scrollToSection]);

  return (
    <>
      <Header handleScrollToSection={setHashNavigation} />
      <Mission />
      <How />
      <Community />
      <Contribution />
      <Team />
    </>
  );
}
