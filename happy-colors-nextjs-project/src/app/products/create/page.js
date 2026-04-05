// happy-colors-nextjs-project/src/app/products/create/page.js

import CreateProductClient from './CreateProductClient';

export const metadata = {
  title: 'Създаване на продукт',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreateProductPage() {
  return <CreateProductClient />;
}
