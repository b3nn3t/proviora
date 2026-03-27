"use client";

import { motion } from "framer-motion";
import { Filter, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const categories = ["Все товары", "БАДы", "Уход за кожей", "Витамины", "Наборы"];

export default function CatalogGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
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
    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen text-[#243A5E]">
      {/* Top Bar: Filters & Sorting */}
      <div className="border-b border-gray-200 sticky top-20 bg-white z-30">
        <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm whitespace-nowrap hover:border-[#243A5E] transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-sm font-medium">
              <Filter size={18} />
              <span>Фильтры</span>
            </button>
            <button className="flex items-center space-x-2 text-sm font-medium">
              <span>Сортировка</span>
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#d4af37]" size={40} />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
              <div>
                <h3 className="font-bold mb-4 uppercase text-xs tracking-widest">Категории</h3>
                <div className="space-y-2">
                  {categories.map(c => (
                    <label key={c} className="flex items-center space-x-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#243A5E] focus:ring-[#243A5E]" />
                      <span className="text-sm group-hover:text-[#d4af37] transition-colors">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {products.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl opacity-50">
                  Товары не найдены
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl font-playfair">
                            {product.name[0]}
                          </div>
                        )}
                        <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:bg-[#243A5E] hover:text-white">
                          +
                        </button>                        {product.isBestseller === 1 && (
                          <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter shadow-sm">
                            Best Seller
                          </div>
                        )}
                      </div>                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <span className="text-[#d4af37]">★</span>
                          <span>{product.rating || "5.0"}</span>
                          <span>({product.reviews || "0"})</span>
                        </div>
                        <h3 className="font-medium text-sm group-hover:underline decoration-[#d4af37] underline-offset-4">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-400">{product.category}</p>
                        <p className="font-bold mt-2">{product.price}</p>
                      </div>
                      
                      <button className="mt-4 w-full py-2 border border-[#243A5E] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#243A5E] hover:text-white transition-all">
                        Добавить
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
