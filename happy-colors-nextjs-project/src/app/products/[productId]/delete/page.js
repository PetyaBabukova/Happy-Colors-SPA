'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, use } from 'react';
import baseURL from '@/config';
import styles from './delete.module.css';

export default function DeleteProductPage({ params }) {
  const { productId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${baseURL}/products/${productId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Грешка при зареждане');

        setProduct(data);
        setIsOwner(user?._id === data.owner);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProduct();
  }, [user, productId]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${baseURL}/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Грешка при изтриването');

      router.push('/products');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className={styles.message}>Зареждане...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!isOwner) return <p className={styles.error}>Нямате права да изтриете този продукт</p>;

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
