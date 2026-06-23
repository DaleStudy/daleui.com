import { useCallback, useEffect } from "react";
import { Community } from "../sections/marketing/Community";
import { Contribution } from "../sections/marketing/Contribution";
import { Header } from "../sections/marketing/Header";
import { How } from "../sections/marketing/How";
import { Mission } from "../sections/marketing/Mission";
import { Team } from "../sections/marketing/Team";
import { Navigation } from "../sections/marketing/Navigation";
import { Footer } from "../sections/marketing/Footer";
import { staticOgImageUrl } from "../og/ogImage";
import { SeoMeta } from "../components/SeoMeta";

const title = "Dale UI";
const description =
  "쉽고 가볍게 사용하는 오픈소스 디자인 시스템. 달레UI로 일관된 사용자 경험을 빠르게 만들어보세요.";
const image = staticOgImageUrl("home");

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
      <SeoMeta title={title} description={description} image={image} />
      <Navigation />
      <Header handleScrollToSection={setHashNavigation} />
      <Mission />
      <How />
      <Community />
      <Contribution />
      <Team />
      <Footer />
    </>
  );
}
