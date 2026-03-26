"use client";

import { motion } from "framer-motion";

export default function About({ onOpenAbout }: { onOpenAbout: () => void }) {
  return (
    <section id="о нас" className="py-32 bg-[#f5e6be] text-[#243A5E] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:w-1/2 relative"
          >
            <div className="aspect-square bg-white/30 rounded-full absolute -top-20 -left-20 w-80 h-80 blur-3xl opacity-50" />
            <div className="relative z-10 aspect-[4/5] bg-[#243A5E]/5 shadow-2xl flex items-center justify-center text-8xl font-playfair text-[#243A5E]/10">
              P
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:w-1/2 space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-playfair font-bold leading-tight">
              Наша идеология
            </h2>
            <p className="text-lg leading-relaxed opacity-80">
              Мы подходим к уходу комплексно — изнутри и снаружи. Наша задача — не просто предложить продукт, а дать решение для контроля состояния организма и кожи.
            </p>
            <p className="text-lg leading-relaxed opacity-80">
              Мы опираемся на мнения экспертов и реальный опыт потребителей, отбирая только те продукты, которые показывают результат. В ассортименте — проверенные бренды, поставляемые через официальных дистрибьюторов.
            </p>
            <p className="text-lg leading-relaxed opacity-80">
              Каждый продукт проходит анализ состава и отзывов перед тем, как попасть в каталог.
            </p>
            <div className="pt-6">
              <button 
                onClick={onOpenAbout}
                className="px-10 py-5 bg-[#243A5E] text-white uppercase tracking-widest text-sm hover:bg-[#d4af37] hover:text-[#243A5E] transition-all duration-500"
              >
                Узнать больше
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
