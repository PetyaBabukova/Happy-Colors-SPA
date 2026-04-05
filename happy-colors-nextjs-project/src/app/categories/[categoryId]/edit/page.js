// happy-colors-nextjs-project/src/app/categories/[categoryId]/edit/page.js

import EditCategoryClient from './EditCategoryClient';

export const metadata = {
  title: 'Редактиране на категория',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditCategoryPage() {
  return <EditCategoryClient />;
}
