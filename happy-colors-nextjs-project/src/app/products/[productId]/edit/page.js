// happy-colors-nextjs-project/src/app/products/[productId]/edit/page.js

import EditProductClient from './EditProductClient';

export const metadata = {
  title: 'Редактиране на продукт',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditProductPage({ params }) {
  return <EditProductClient params={params} />;
}
