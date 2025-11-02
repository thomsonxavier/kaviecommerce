import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cookieStorage } from "../utils/cookies";

export interface Product {
  id: string;
  name: string;
  category: "Personal Care" | "Home Care";
  type: string;
  sizes: { value: string; price: number }[];
  images?: string[]; // Changed from image to images array (up to 5)
  description?: string;
  ingredients?: string[];
  inStock?: boolean; // Added out of stock flag
}

export interface CartItem {
  id: string;
  name: string;
  selectedSize: string;
  price: number;
  quantity: number;
  category: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  accessToken: string | null;
  addToCart: (product: Product, selectedSize: string) => void;
  removeFromCart: (id: string, selectedSize: string) => void;
  updateQuantity: (id: string, selectedSize: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  setUser: (user: User | null, accessToken: string | null) => void;
  logout: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      user: null,
      accessToken: null,

      addToCart: (product, selectedSize) =>
        set((state) => {
          const existingItem = state.cart.find(
            (item) => item.id === product.id && item.selectedSize === selectedSize
          );

          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id && item.selectedSize === selectedSize
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          const sizeOption = product.sizes.find((s) => s.value === selectedSize);
          if (!sizeOption) return state;

          return {
            cart: [
              ...state.cart,
              {
                id: product.id,
                name: product.name,
                selectedSize,
                price: sizeOption.price,
                quantity: 1,
                category: product.category,
              },
            ],
          };
        }),

      removeFromCart: (id, selectedSize) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.id === id && item.selectedSize === selectedSize)
          ),
        })),

      updateQuantity: (id, selectedSize, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id && item.selectedSize === selectedSize
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      setUser: (user, accessToken) => set({ user, accessToken }),

      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "kavis-naturals-storage",
      storage: {
        getItem: (name) => cookieStorage.getItem(name),
        setItem: (name, value) => cookieStorage.setItem(name, value),
        removeItem: (name) => cookieStorage.removeItem(name),
      },
    }
  )
);
