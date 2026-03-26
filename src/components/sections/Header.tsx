"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/useCart";
import CartModal from "@/components/modals/CartModal";

export default function Header({ activeModal, setActiveModal }: { activeModal: "about" | "contacts" | "auth" | null, setActiveModal: (val: "about" | "contacts" | "auth" | null) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCart();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password,
          rememberMe 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setActiveModal(null);
        router.push("/profile");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Ошибка соединения");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-[#243A5E]/95 backdrop-blur-md py-4 shadow-lg" 
            : "bg-[#243A5E] py-6 shadow-md"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-playfair font-bold tracking-[0.2em]">
            <span className="text-[#f5e6be]">PRO</span>
            <span className="text-[#d4af37]">VIORA</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-12">
            <Link href="/" className="text-sm uppercase tracking-widest hover:text-[#d4af37] transition-colors duration-300">Главная</Link>
            <Link href="/catalog" className="text-sm uppercase tracking-widest hover:text-[#d4af37] transition-colors duration-300">Каталог</Link>
            <button onClick={() => setActiveModal("about")} className="text-sm uppercase tracking-widest hover:text-[#d4af37] transition-colors duration-300">О нас</button>
            <button onClick={() => setActiveModal("contacts")} className="text-sm uppercase tracking-widest hover:text-[#d4af37] transition-colors duration-300">Контакты</button>
          </nav>

          <div className="flex items-center space-x-6">
            {user ? (
              <Link href="/profile" className="hidden md:flex items-center space-x-2 text-sm uppercase tracking-widest hover:text-[#d4af37] transition-colors duration-300">
                <User size={20} />
                <span>{user.name}</span>
              </Link>
            ) : (
              <button onClick={() => setActiveModal("auth")} className="hidden md:flex items-center space-x-2 text-sm uppercase tracking-widest hover:text-[#d4af37] transition-colors duration-300">
                <User size={20} />
                <span>Войти</span>
              </button>
            )}

            <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:text-[#d4af37] transition-colors duration-300">
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#d4af37] text-[#243A5E] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#243A5E] border-t border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 space-y-4">
                <Link href="/" className="text-lg uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Главная</Link>
                <Link href="/catalog" className="text-lg uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Каталог</Link>
                <button className="text-left text-lg uppercase tracking-widest" onClick={() => { setIsMenuOpen(false); setActiveModal("about"); }}>О нас</button>
                <button className="text-left text-lg uppercase tracking-widest" onClick={() => { setIsMenuOpen(false); setActiveModal("contacts"); }}>Контакты</button>
                {user ? (
                  <Link href="/profile" className="text-left text-lg uppercase tracking-widest text-[#d4af37]" onClick={() => setIsMenuOpen(false)}>{user.name}</Link>
                ) : (
                  <button className="text-left text-lg uppercase tracking-widest text-[#d4af37]" onClick={() => { setIsMenuOpen(false); setActiveModal("auth"); }}>Личный кабинет</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Modal isOpen={activeModal === "auth"} onClose={() => setActiveModal(null)} title={authMode === "login" ? "Вход в кабинет" : "Регистрация"}>
        <div className="space-y-8">
          <div className="flex p-1 bg-[#243A5E]/5 rounded-2xl">
            <button onClick={() => setAuthMode("login")} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${authMode === "login" ? "bg-white text-[#243A5E] shadow-sm" : "text-[#243A5E]/40 hover:text-[#243A5E]"}`}>Вход</button>
            <button onClick={() => setAuthMode("register")} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${authMode === "register" ? "bg-white text-[#243A5E] shadow-sm" : "text-[#243A5E]/40 hover:text-[#243A5E]"}`}>Регистрация</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {authMode === "register" && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#243A5E]/40 ml-2">Имя</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-white rounded-2xl border border-[#243A5E]/5 outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-black" placeholder="Иван Иванов" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#243A5E]/40 ml-2">E-mail</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-white rounded-2xl border border-[#243A5E]/5 outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-black" placeholder="example@mail.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#243A5E]/40 ml-2">Пароль</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-white rounded-2xl border border-[#243A5E]/5 outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-black" placeholder="••••••••" />
            </div>

            {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}

            <button type="submit" className="w-full py-5 bg-[#243A5E] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#d4af37] hover:text-[#243A5E] transition-all shadow-lg">
              {authMode === "login" ? "Войти в кабинет" : "Создать аккаунт"}
            </button>
          </form>
        </div>
      </Modal>

      <Modal isOpen={activeModal === "about"} onClose={() => setActiveModal(null)} title="О проекте Proviora">
        <div className="space-y-8 text-[#243A5E]">
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">Наша миссия</h4>
            <p className="text-lg leading-relaxed">Proviora — это не просто магазин, это экосистема заботы о себе. Мы верим, что красота начинается изнутри, поэтому объединяем лучшие БАДы и косметические средства в одном месте.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="p-6 bg-white/50 rounded-2xl border border-[#243A5E]/5">
              <h5 className="font-bold mb-2">Качество</h5>
              <p className="text-sm opacity-70">Только сертифицированные бренды и проверенные составы.</p>
            </div>
            <div className="p-6 bg-white/50 rounded-2xl border border-[#243A5E]/5">
              <h5 className="font-bold mb-2">Экспертность</h5>
              <p className="text-sm opacity-70">Каждый продукт проходит тщательный отбор нашими специалистами.</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === "contacts"} onClose={() => setActiveModal(null)} title="Контакты">
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">Наш адрес</h4>
              <p className="text-[#243A5E] text-lg leading-relaxed">Москва, ул. Пречистенка, 12<br/>Бизнес-центр "Премиум", офис 402</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">Связь с нами</h4>
              <div className="space-y-2">
                <p className="text-[#243A5E] text-2xl font-bold">+7 (999) 123-45-67</p>
                <p className="text-[#243A5E] text-lg opacity-70">info@proviora.ru</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
