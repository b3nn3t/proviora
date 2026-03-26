"use client";

import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer id="контакты" className="py-24 bg-[#243A5E] text-white border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-playfair font-bold mb-8 tracking-widest">
              PROVIORA
            </h2>
            <p className="text-sm opacity-60 leading-relaxed max-w-xs">
              Премиальные решения для вашего здоровья и красоты. Наука и природа в гармонии.
            </p>
          </div>

          <div className="col-span-1">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold mb-8">
              Навигация
            </h3>
            <ul className="space-y-4 text-sm opacity-70">
              <li><a href="#каталог" className="hover:text-[#d4af37] transition-colors">Каталог</a></li>
              <li><a href="#о нас" className="hover:text-[#d4af37] transition-colors">О бренде</a></li>
              <li><a href="#" className="hover:text-[#d4af37] transition-colors">Доставка</a></li>
              <li><a href="#" className="hover:text-[#d4af37] transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold mb-8">
              Контакты
            </h3>
            <ul className="space-y-4 text-sm opacity-70">
              <li>info@proviora.ru</li>
              <li>+7 (999) 123-45-67</li>
              <li>Москва, ул. Пречистенка, 12</li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-bold mb-8">
              Подписка
            </h3>
            <p className="text-xs opacity-60 mb-6">
              Получайте эксклюзивные предложения и новости бренда.
            </p>
            <div className="flex border-b border-white/20 pb-2">
              <input 
                type="email" 
                placeholder="Ваш e-mail" 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:opacity-30"
              />
              <button className="text-xs uppercase tracking-widest text-[#d4af37] hover:opacity-70 transition-opacity">
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-widest opacity-40 mb-6 md:mb-0">
            © 2024 Proviora. Все права защищены.
          </p>
          <div className="flex space-x-8 opacity-60">
            <Instagram size={20} className="hover:text-[#d4af37] cursor-pointer transition-colors" />
            <Facebook size={20} className="hover:text-[#d4af37] cursor-pointer transition-colors" />
            <Twitter size={20} className="hover:text-[#d4af37] cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
