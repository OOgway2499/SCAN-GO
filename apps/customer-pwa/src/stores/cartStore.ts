import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartProduct {
  id: string;
  productId: string;
  name: string;
  brand: string;
  icon: string;
  price: number;
  mrp: number;
  gstRate: number;
  qty: number;
  category: string;
  barcode?: string;
}

interface CartState {
  items: CartProduct[];
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, delta: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  gstAmount: () => number;
  total: () => number;
  count: () => number;
  savings: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.productId
                  ? { ...i, qty: i.qty + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...product, qty: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQty: (productId, delta) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, qty: Math.max(1, i.qty + delta) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      subtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      gstAmount: () => get().items.reduce((s, i) => s + i.price * i.qty * i.gstRate, 0),
      total: () => get().subtotal() + get().gstAmount(),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      savings: () => get().items.reduce((s, i) => s + (i.mrp - i.price) * i.qty, 0),
    }),
    {
      name: 'scango-cart',
    }
  )
);
