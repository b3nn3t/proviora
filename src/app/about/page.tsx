"use client";

import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import PageTransition from "@/components/animations/PageTransition";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AboutPage() {
  const [activeModal, setActiveModal] = useState<"about" | "contacts" | "auth" | null>(null);

  return (
    <PageTransition>
      <Header activeModal={activeModal} setActiveModal={setActiveModal} />
      <main className="pt-32 pb-20 bg-white min-h-screen text-[#243A5E]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-12">О компании Proviora</h1>
            
            <div className="aspect-video bg-gray-100 rounded-3xl mb-16 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl font-playfair">
                Proviora Story
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-lg leading-relaxed">
              <div className="space-y-6">
                <p>
                  Proviora — это не просто бренд, это философия осознанного подхода к здоровью и красоте. Мы верим, что истинная гармония начинается изнутри.
                </p>
                <p>
                  Наша миссия — предоставлять продукты высочайшего качества, основанные на научных исследованиях и силе природы.
                </p>
              </div>
              <div className="space-y-6">
                <p>
                  Мы тщательно отбираем каждый ингредиент, работая только с проверенными поставщиками и современными лабораториями.
                </p>
                <p>
                  Каждый продукт Proviora проходит строгий контроль качества, чтобы вы могли быть уверены в его эффективности и безопасности.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
