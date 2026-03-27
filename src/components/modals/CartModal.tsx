"use client";

import { useCart } from "@/lib/store/useCart";
import { X, Plus, Minus, ShoppingBag, Loader2, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/lib/store/useToast";

export default function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);  const router = useRouter();

  const handleGoToProfile = () => {
    onClose();
    router.push("/profile");
  };

  const handleClearCart = () => {
    if (confirm("Вы уверены, что хотите очистить корзину?")) {
      clearCart();
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total_price: total().toLocaleString() + " UZS"
        })
      });
      if (res.ok) {
        addToast("Заказ успешно оформлен!");
        clearCart();
        onClose();
      } else {
        const data = await res.json();
        addToast(data.error || "Ошибка при оформлении", "error");
      }
    } catch (err) {
      addToast("Ошибка сети", "error");
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-[#f5e6be] shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b flex items-center justify-between bg-[#243A5E] text-white">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="text-[#d4af37]" />
              <h2 className="text-xl font-bold">Корзина</h2>
            </div>
            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button 
                  onClick={handleClearCart}
                  className="p-2 text-red-400 hover:text-red-300 rounded-full transition-all"
                  title="Очистить корзину"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 text-[#243A5E]">
                <ShoppingBag size={64} />
                <p className="text-lg font-medium">Ваша корзина пуста</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 group bg-white/50 p-4 rounded-2xl border border-[#243A5E]/5">
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-playfair text-gray-300">
                        {item.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#243A5E] truncate">{item.name}</h4>
                    <p className="text-sm text-[#d4af37] font-bold">{item.price}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-white border border-[#243A5E]/10 rounded-lg flex items-center justify-center hover:border-[#243A5E] text-[#243A5E] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center text-[#243A5E]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-white border border-[#243A5E]/10 rounded-lg flex items-center justify-center hover:border-[#243A5E] text-[#243A5E] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-[#243A5E]/20 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t bg-white/50 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between text-lg font-bold text-[#243A5E]">
                <span>Итого:</span>
                <span>{total().toLocaleString()} UZS</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleGoToProfile}
                  className="py-4 bg-white border-2 border-[#243A5E] text-[#243A5E] rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#243A5E] hover:text-white transition-all flex items-center justify-center space-x-2"
                >
                  <User size={16} />
                  <span>В кабинет</span>
                </button>
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="py-4 bg-[#243A5E] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#d4af37] hover:text-[#243A5E] transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <span>Оформить</span>}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
