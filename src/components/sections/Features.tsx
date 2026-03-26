"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Leaf, Zap } from "lucide-react";

const features = [
  {
    icon: <Leaf className="w-8 h-8 text-[#d4af37]" />,
    title: "Цель",
    description: "Наша цель - предоставлять базовые решения по поддержке здоровья изнутри и снаружи, используя эффективные средства.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-[#d4af37]" />,
    title: "Качество",
    description: "Качество которому можно доверять. Мы работаем с брендами, соответствующими требованиям международных стандартов - GMP и cGMP.",
  },
  {
    icon: <Zap className="w-8 h-8 text-[#d4af37]" />,
    title: "Эффективность",
    description: "Мы выбираем бренды, которые опираются на иследования, клинические данные и реальные отзывы, а не маркетинговые обещания.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-[#f5e6be] text-[#001233]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-white/50 shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-playfair font-bold uppercase tracking-widest">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed opacity-80 max-w-xs">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
