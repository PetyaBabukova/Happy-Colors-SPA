// happy-colors-nextjs-project/src/app/products/create/page.js

'use client';
import ProductForm from '@/components/products/ProductForm';
import { onCreateProductSubmit } from '@/managers/productsManager';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';

export default function CreateProductPage() {
  const { user } = useAuth();
  const { triggerCategoriesReload } = useProducts();

  return (
    <ProductForm
      initialValues={{
        title: '',
        description: '',
        category: '',
        price: '',
        imageUrl: '',

        // ✅ НОВО
        availability: 'available',
      }}
      onSubmit={(values, setSuccess, setError, setInvalidFields, router) =>
        onCreateProductSubmit(
          values,
          setSuccess,
          setError,
          setInvalidFields,
          user,
          router,
          triggerCategoriesReload
        )
      }
      legendText="Създаване на нов продукт"
      successMessage="Продуктът беше създаден успешно!"
    />
  );
}
