'use client';
import ProductForm from '@/components/products/ProductForm';
import { onEditProductSubmit } from '@/managers/productsManager';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import baseURL from '@/config';


export default function EditProductPage({ params }) {
  const { productId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${baseURL}/products/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(() => router.push('/not-found'));
  }, [productId, router]);

  if (!product) return <p>Зареждане...</p>;

  return (
    <ProductForm
      initialValues={product}
      onSubmit={(values, setSuccess, setError, setInvalidFields) =>
        onEditProductSubmit(productId, values, setSuccess, setError, setInvalidFields, user, router)
      }
      legendText="Редактиране на продукта"
      successMessage="Продуктът беше редактиран успешно!"
    />
  );
}
