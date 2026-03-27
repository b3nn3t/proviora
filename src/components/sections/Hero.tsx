"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import TextScene from "@/components/animations/TextScene";
import Header from "@/components/sections/Header";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);
  const [activeModal, setActiveModal] = useState<"about" | "contacts" | "auth" | null>(null);
  
  const { scrollYProgress } = useScroll({    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Плавный скролл для 3D
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      setProgress(v);
      // Показываем контент, когда камера пролетела сквозь текст
      if (v > 0.8) {
        setShowContent(true);
        if (!isAnimationFinished) {
          setIsAnimationFinished(true);
          // Фиксируем скролл, чтобы нельзя было вернуться к анимации
          document.body.style.overflow = "auto";
        }
      }
    });
    return () => unsubscribe();
  }, [smoothProgress, isAnimationFinished]);

  // Блокируем скролл вверх, если анимация пройдена
  useEffect(() => {
    const handleScroll = () => {
      if (isAnimationFinished && window.scrollY < window.innerHeight) {
        window.scrollTo(0, window.innerHeight);
      }
    };

    if (isAnimationFinished) {
      window.addEventListener("scroll", handleScroll);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAnimationFinished]);

  // Анимация фона
  const bgColor = useTransform(
    scrollYProgress,
    [0.5, 0.8],
    ["#243A5E", "#f5e6be"]
  );

  if (isAnimationFinished && typeof window !== 'undefined' && window.scrollY > window.innerHeight * 2) {
    // Можно было бы полностью удалять секцию, но для плавности оставим логику блокировки
  }

  return (
    <section 
      ref={containerRef} 
      id="hero-section"
      className={`relative w-full ${isAnimationFinished ? 'h-screen overflow-hidden' : 'h-[300vh]'}`}
      style={{ display: isAnimationFinished ? 'none' : 'block' }}
    >
      {/* 3D Canvas Container */}
      <motion.div 
        style={{ backgroundColor: bgColor }}
        className="sticky top-0 left-0 w-full h-screen z-10 overflow-hidden"
      >
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <TextScene scrollProgress={progress} />
          </Suspense>
        </Canvas>

        {/* Transition Flash */}
        <motion.div
          style={{
            opacity: useTransform(scrollYProgress, [0.6, 0.7, 0.8], [0, 1, 0]),
          }}
          className="absolute inset-0 bg-white pointer-events-none z-20"
        />
      </motion.div>

      {/* Header appears after transition */}
      {showContent && <Header activeModal={activeModal} setActiveModal={setActiveModal} />}
    </section>
  );
}
