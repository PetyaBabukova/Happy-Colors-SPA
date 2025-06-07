'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { checkProductAccess } from '@/utils/checkProductAccess';
import MessageBox from '@/components/ui/MessageBox';
import styles from './delete.module.css';

export default function DeleteProductPage() {
  const { productId } = useParams(); // 🟢 Тук е разликата
  const { user } = useAuth();
  const { triggerCategoriesReload } = useProducts();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user === undefined || !productId) return;

    checkProductAccess(productId, user).then(({ product, unauthorized }) => {
      setProduct(product);
      setUnauthorized(unauthorized);
      setLoading(false);
    });
  }, [productId, user]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3030/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Грешка при изтриването');

      triggerCategoriesReload();
      router.push('/products');
    } catch (err) {
      setError(err.message);
    }
  };
if (user === undefined || loading) return null;
  // if (user === undefined || loading) return <p className={styles.message}>Зареждане...</p>;
  if (unauthorized) return <MessageBox type="error" message="Нямате права да премахнете този продукт." />;
  if (error) return <MessageBox type="error" message={`Грешка: ${error}`} />;

  return (
    <div className={styles.deleteContainer}>
      <h2>Сигурни ли сте, че искате да изтриете "{product.title}"?</h2>
      <div className={styles.buttons}>
        <button className={styles.deleteBtn} onClick={handleDelete}>Да</button>
        <button className={styles.cancelBtn} onClick={() => router.push(`/products/${productId}`)}>Отказ</button>
      </div>
    </div>
  );
}
