"use client";

import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Bestsellers from "@/components/sections/Bestsellers";
import About from "@/components/sections/About";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import { useState, useEffect } from "react";

export default function Home() {
  const [isHeroFinished, setIsHeroFinished] = useState(false);
  const [activeModal, setActiveModal] = useState<"about" | "contacts" | "auth" | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!isHeroFinished && window.scrollY > window.innerHeight * 1.5) {
        setIsHeroFinished(true);
        window.scrollTo(0, 0); // Сбрасываем скролл для основного контента
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHeroFinished]);

  return (
    <main className="relative">
      {!isHeroFinished ? (
        <Hero />
      ) : (
        <>
          <Header activeModal={activeModal} setActiveModal={setActiveModal} />
          <div className="relative z-20">
            <Features />
            <Bestsellers />
            <About onOpenAbout={() => setActiveModal("about")} />
            <Footer />
          </div>
        </>
      )}
    </main>
  );
}
