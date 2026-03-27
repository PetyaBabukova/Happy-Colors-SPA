// app/cart/page.js

import CartPage from '@/components/cart/CartPage';

export const metadata = {
  title: 'Количка',
  description: 'Количка с избраните продукти в Happy Colors.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Cart() {
  return <CartPage />;
}