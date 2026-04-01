"use client";

import { formatPrice } from "@/lib/formatPrice";
import { motion } from "framer-motion";
import { Filter, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/store/useCart";
import { useToast } from "@/lib/store/useToast";

const categories = ["Все товары", "Уход за кожей", "Витамины/Нутриенты", "Наборы"];


export default function CatalogGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Все товары");
  const [maxPrice, setMaxPrice] = useState(10000000);
  const { addItem } = useCart();
  const { addToast } = useToast();
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

  const parsePrice = (price: any) => {
  if (!price) return 0;

  if (typeof price === "number") return price;

  if (typeof price === "string") {
    return parseInt(price.replace(/[^0-9]/g, "")) || 0;
  }

  return 0;
};

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "Все товары" || p.category === selectedCategory;
    const matchesPrice = parsePrice(p.price) <= maxPrice;
    return matchesCategory && matchesPrice;
  });

  return (
    <div className="bg-white min-h-screen text-[#243A5E]">
      <div className="border-b border-gray-200 sticky top-20 bg-white z-30">
        <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full border text-xs md:text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? "bg-[#243A5E] text-white border-[#243A5E]" 
                    : "border-gray-200 hover:border-[#243A5E]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <button className="flex items-center space-x-2 text-xs md:text-sm font-medium">
              <Filter size={16} className="md:w-[18px] md:h-[18px]" />
              <span>Фильтры</span>
            </button>
            <button className="flex items-center space-x-2 text-xs md:text-sm font-medium">
              <span>Сортировка</span>
              <ChevronDown size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
          </div>        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#d4af37]" size={40} />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
              <div>
                <h3 className="font-bold mb-4 uppercase text-xs tracking-widest">Категории</h3>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <label key={c} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category"
                        checked={selectedCategory === c}
                        onChange={() => setSelectedCategory(c)}
                        className="w-4 h-4 border-gray-300 text-[#243A5E] focus:ring-[#243A5E]" 
                      />
                      <span className={`text-sm transition-colors ${selectedCategory === c ? "text-[#d4af37] font-bold" : "group-hover:text-[#d4af37]"}`}>
                        {c}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-4 uppercase text-xs tracking-widest">Цена</h3>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="0"
                    max="10000000"
                    step="100000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-[#243A5E] cursor-pointer" 
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 UZS</span>
                    <span className="font-bold text-[#243A5E]">{maxPrice.toLocaleString()} UZS</span>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl opacity-50">
                  Товары не найдены
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                    {product.image ? (
  <img
    src={`http://localhost:3000${product.image}`}
    alt={product.name}
    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
  />
) : (
  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl font-playfair">
    {product.name ? product.name[0] : "?"}
  </div>
)}
                        <button 
                          onClick={() => {
                            addItem(product);
                            addToast("Товар добавлен в корзину");
                          }}
                          className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:bg-[#243A5E] hover:text-white"
                        >
                          +
                        </button>                        {product.is_bestseller === 1 && (
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
                        <p className="font-bold mt-2">{formatPrice(product.price)}</p>
                      </div>                      
                      <button 
                        onClick={() => {
                          addItem(product);
                          addToast("Товар добавлен в корзину");
                        }}
                        disabled={product.stock <= 0}                        className={`mt-4 w-full py-2 border rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                          product.stock > 0 
                            ? "border-[#243A5E] hover:bg-[#243A5E] hover:text-white" 
                            : "border-gray-200 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {product.stock > 0 ? "Добавить" : "Нет в наличии"}
                      </button>                    </motion.div>
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
