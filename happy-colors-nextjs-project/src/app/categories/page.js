import CategoriesClientPage from './CategoriesClientPage';

export const metadata = {
  title: 'Управление на категории',
  description: 'Вътрешна страница за управление на категориите в Happy Colors.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CategoriesPage() {
  return <CategoriesClientPage />;
}