'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../cart/CartProvider';

export function SessProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Ensure CartProvider is INSIDE SessionProvider */}
       <CartProvider>
          {children}
       </CartProvider>
    </SessionProvider>
  );
}