import { create } from "zustand";

type CartItem = {
  id: number;
  name: string;
  price: number | string;
  image?: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  total: () => number;
};

export const useCart = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.id === item.id);

    if (existing) {
      set({
        items: items.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({
        items: [...items, { ...item, quantity: 1 }],
      });
    }
  },

  removeItem: (id) =>
    set({
      items: get().items.filter((item) => item.id !== id),
    }),

  updateQuantity: (id, delta) => {
    const items = get().items;

    set({
      items: items.map((i) => {
        if (i.id === id) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      }),
    });
  },

  clearCart: () => set({ items: [] }),

  total: () => {
    return get().items.reduce((acc, item) => {
      const price =
        typeof item.price === "number"
          ? item.price
          : parseInt(String(item.price).replace(/[^0-9]/g, "")) || 0;

      return acc + price * item.quantity;
    }, 0);
  },
}));