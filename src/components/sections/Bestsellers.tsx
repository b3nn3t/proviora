"use client";

import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store/useCart";

import { useToast } from "@/lib/store/useToast";

export default function Bestsellers() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { addToast } = useToast();
  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const res = await fetch("/api/products/bestsellers");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestsellers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-white">
        <Loader2 className="animate-spin text-[#d4af37]" size={40} />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-24 text-[#243A5E]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-playfair mb-4">Лучшие товары</h2>
            <p className="text-gray-500">
              Наши самые популярные продукты, отобранные экспертами для вашего здоровья и красоты.
            </p>
          </div>
          <Link 
            href="/catalog" 
            className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest hover:text-[#d4af37] transition-colors group"
          >
            <span>Весь каталог</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col"
            >
              <div className="relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden mb-6">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-7xl font-playfair select-none">
                    {product.name[0]}
                  </div>
                )}                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-end p-6">
                  <button 
                    onClick={() => {
                      addItem(product);
                      addToast("Товар добавлен в корзину");
                    }}
                    className="w-full py-3 bg-white text-[#243A5E] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 font-bold text-xs uppercase tracking-widest hover:bg-[#243A5E] hover:text-white"
                  >
                    В корзину
                  </button>                </div>

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter shadow-sm">
                  Best Seller
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{product.category}</p>
                  <div className="flex items-center space-x-1 text-[10px] font-bold">
                    <span className="text-[#d4af37]">★</span>
                    <span>{product.rating || "5.0"}</span>
                  </div>
                </div>
                <h3 className="font-medium text-lg leading-tight group-hover:text-[#d4af37] transition-colors">
                  {product.name}
                </h3>
                <p className="font-bold text-xl">{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
