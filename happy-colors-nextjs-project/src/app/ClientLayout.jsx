'use client';

import Header from '@/components/header/header';
import AuthWrapper from '@/context/AuthWrapper';
import { ProductProvider } from '@/context/ProductContext';

export default function ClientLayout({ children }) {
  return (
    <AuthWrapper>
      <ProductProvider>
        <Header />
        <main>{children}</main>
      </ProductProvider>
    </AuthWrapper>
  );
}
