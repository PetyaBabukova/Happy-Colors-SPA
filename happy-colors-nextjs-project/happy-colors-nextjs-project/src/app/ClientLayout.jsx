//import { CartProvider } from '@/context/CartContext';

'use client';

import Header from '@/components/header/header';
import AuthWrapper from '@/context/AuthWrapper';
import { ProductProvider } from '@/context/ProductContext';
import { CartProvider } from '@/context/CartContext';

export default function ClientLayout({ children }) {
  return (
    <AuthWrapper>
      <ProductProvider>
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
      </ProductProvider>
    </AuthWrapper>
  );
}
