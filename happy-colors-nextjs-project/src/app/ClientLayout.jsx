'use client';

import Header from '@/components/header/header';

export default function ClientLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
