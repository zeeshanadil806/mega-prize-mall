// stores/cart-store.ts
import { CartItem } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Match your product interface from BargainButton

export type LoadedProduct = Omit<CartItem, 'quantity' | 'bargainCouponId' | 'bargainDiscount'>;
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyBargainToItem: (productId: string, couponId: string, discountAmount: number) => void;
  removeBargainFromItem: (productId: string) => void;
  clearCart: () => void;
  getItem: (productId: string) => CartItem | undefined;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountTotal: () => number;
  getGrandTotal: () => number;
  loadedProducts: Record<string, LoadedProduct>;
  setLoadedProducts: (products: Record<string, LoadedProduct>) => void;
  getBargainEligibleItems: () => CartItem[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(i => i.productId === item.productId);
          
          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map(i =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          } else {
            // Add new item
            return { items: [...state.items, item] };
          }
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(i => i.productId !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },
      
      applyBargainToItem: (productId, couponId, discountAmount) => {
        set((state) => ({
          items: state.items.map(i =>
            i.productId === productId
              ? { 
                  ...i, 
                  bargainCouponId: couponId,
                  bargainDiscount: discountAmount 
                }
              : i
          ),
        }));
      },
      
      loadedProducts: {},

setLoadedProducts: (products) => {
  set({ loadedProducts: products });
},

getBargainEligibleItems: () => {
  const state = get();
  return state.items.filter(item => {
    const product = state.loadedProducts[item.productId];
    return product?.bargainEnabled && !item.bargainCouponId;
  });
},

      removeBargainFromItem: (productId) => {
        set((state) => ({
          items: state.items.map(i =>
            i.productId === productId
              ? { 
                  ...i, 
                  bargainCouponId: undefined,
                  bargainDiscount: undefined 
                }
              : i
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getItem: (productId) => {
        return get().items.find(i => i.productId === productId);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.price;
          return total + (price * item.quantity);
        }, 0);
      },
      
      getDiscountTotal: () => {
        return get().items.reduce((total, item) => {
          const bargainDiscount = item.bargainDiscount || 0;
          const priceDiff = item.discountedPrice 
            ? (item.price - item.discountedPrice) * item.quantity 
            : 0;
          return total + bargainDiscount + priceDiff;
        }, 0);
      },
      
      getGrandTotal: () => {
          const subtotal = get().getSubtotal();
          // console.log(subtotal)
          const discountTotal = get().getDiscountTotal();
          // console.log(discountTotal)
        return Math.max(0, subtotal - discountTotal);
      },
    }),
    {
      name: 'megaprize-cart',
      version: 1,
    }
  )
);