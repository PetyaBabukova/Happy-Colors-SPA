// happy-colors-nextjs-project/src/app/products/[productId]/delete/page.js

import DeleteProductClient from './DeleteProductClient';

export const metadata = {
  title: 'Изтриване на продукт',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeleteProductPage({ params }) {
  return <DeleteProductClient params={params} />;
}
