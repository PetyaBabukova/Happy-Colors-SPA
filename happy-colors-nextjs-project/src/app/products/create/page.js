'use client';
import ProductForm from '@/components/products/ProductForm';
import { onCreateProductSubmit } from '@/managers/productsManager';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';

export default function CreateProductPage() {
  const { user } = useAuth();
  const { triggerCategoriesReload } = useProducts(); // 🟢 тук

  return (
    <ProductForm
      initialValues={{ title: '', description: '', category: '', price: '', imageUrl: '' }}
      onSubmit={(values, setSuccess, setError, setInvalidFields, router) =>
        onCreateProductSubmit(
          values,
          setSuccess,
          setError,
          setInvalidFields,
          user,
          router,
          triggerCategoriesReload // 🟢 подаваме
        )
      }
      legendText="Създаване на нов продукт"
      successMessage="Продуктът беше създаден успешно!"
    />
  );
}
