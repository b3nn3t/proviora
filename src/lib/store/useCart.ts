"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  name: string;
  price: string;
  image_url?: string;
  quantity: number;
  stock?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existing = items.find(i => i.id === product.id);
        
        const currentQty = existing ? existing.quantity : 0;
        if (product.stock !== undefined && currentQty >= product.stock) {
          alert(`Извините, на складе всего ${product.stock} шт. этого товара`);
          return;
        }

        if (existing) {
          set({ items: items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQuantity: (id, delta) => {
        const items = get().items;
        const item = items.find(i => i.id === id);
        if (!item) return;

        if (delta > 0 && item.stock !== undefined && item.quantity >= item.stock) {
          alert(`Извините, на складе всего ${item.stock} шт. этого товара`);
          return;
        }

        set({
          items: items.map(i => {
            if (i.id === id) {
              const newQty = Math.max(1, i.quantity + delta);
              return { ...i, quantity: newQty };
            }
            return i;
          })
        });
      },
      clearCart: () => set({ items: [] }),
      total: () => {
        return get().items.reduce((acc, item) => {
          const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
          return acc + price * item.quantity;
        }, 0);
      }
    }),
    { name: 'cart-storage' }
  )
);
