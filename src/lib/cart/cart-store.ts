import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLineItem {
  id: string; // unique line ID
  productId: string;
  name: string;
  slug: string;
  unitPrice: number;
  quantity: number;
  options: Record<string, string>; // e.g. { Size: "A3" }
  artworkKey?: string;
  artworkFilename?: string;
}

interface CartStore {
  items: CartLineItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartLineItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (newItem) => {
        const id = `${newItem.productId}-${JSON.stringify(newItem.options)}-${newItem.artworkKey || ''}`;
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + newItem.quantity } : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...newItem, id }], isOpen: true };
        });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity > 0
              ? state.items.map((i) => (i.id === id ? { ...i, quantity } : i))
              : state.items.filter((i) => i.id !== id),
        })),
      clearCart: () => set({ items: [] }),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: 'inkora-cart-storage',
    },
  ),
);
