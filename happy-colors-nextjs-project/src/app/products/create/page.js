'use client';
import ProductForm from '@/components/products/ProductForm';
import { onCreateProductSubmit } from '@/managers/productsManager';
import { useAuth } from '@/context/AuthContext';

export default function CreateProductPage() {
  const { user } = useAuth();

  return (
    <ProductForm
      initialValues={{ title: '', description: '', category: '', price: '', imageUrl: '' }}
      onSubmit={(values, setSuccess, setError, setInvalidFields, router) =>
        onCreateProductSubmit(values, setSuccess, setError, setInvalidFields, user, router)
      }
      legendText="Създаване на нов продукт"
      successMessage="Продуктът беше създаден успешно!"
    />
  );
}
