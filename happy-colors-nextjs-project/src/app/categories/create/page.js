import CreateCategory from '@/components/categories/CreateCategory';

export const metadata = {
  title: 'Създаване на категория',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreateCategoryPage() {
  return (
    <section className="p-4">
      <CreateCategory />
    </section>
  );
}
