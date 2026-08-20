import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

type CartLine = CatalogProduct & { quantity: number };

type CartContextValue = {
  items: CartLine[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: CatalogProduct) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "clearcart-session-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    hydrated,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    addItem: (product) => {
      setItems((current) => {
        const match = current.find((item) => item.id === product.id);
        if (!match) return [...current, { ...product, quantity: 1 }];
        return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) } : item);
      });
    },
    updateQuantity: (productId, quantity) => {
      setItems((current) => quantity <= 0 ? current.filter((item) => item.id !== productId) : current.map((item) => item.id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item));
    },
    removeItem: (productId) => setItems((current) => current.filter((item) => item.id !== productId)),
    clearCart: () => setItems([]),
  }), [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
