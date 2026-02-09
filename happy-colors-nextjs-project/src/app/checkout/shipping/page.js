// happy-colors-nextjs-project/src/app/checkout/shipping/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShippingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/checkout');
  }, [router]);

  return null;
}
