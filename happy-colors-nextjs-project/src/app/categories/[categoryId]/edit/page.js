'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sanitizeText } from '@/utils/formValidations';
import { handleSubmit } from '@/utils/formSubmitHelper';
import useForm from '@/hooks/useForm';
import { extractErrorMessage } from '@/utils/errorHandler';
import MessageBox from '@/components/ui/MessageBox';
import baseURL from '@/config';
import styles from '@/components/products/create.module.css';
import { useProducts } from '@/context/ProductContext';

export default function EditCategoryPage() {
  const { categoryId } = useParams();
  const router = useRouter();
  const { triggerCategoriesReload } = useProducts();

  const {
    formValues,
    setFormValues,
    error,
    setError,
    success,
    setSuccess,
    invalidFields,
    setInvalidFields,
    handleChange,
  } = useForm({ name: '' });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`${baseURL}/categories/${categoryId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw await res.json();
        const data = await res.json();
        setFormValues({ name: data.name });
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [categoryId, setFormValues, setError]);

  const handleEditSubmit = async (values, setSuccess, setError, setInvalidFields) => {
    try {
      const res = await fetch(`${baseURL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) throw result;

      setSuccess(true);
      setError('');
      setInvalidFields([]);
      triggerCategoriesReload();
      router.push('/categories');
    } catch (err) {
      setSuccess(false);
      setError(extractErrorMessage(err));
      if (err.field) {
        setInvalidFields([err.field]);
      } else {
        setInvalidFields([]);
      }
    }
  };

  if (loading) return <p>Зареждане...</p>;

  return (
    <div className={styles.registerFormContainer}>
      {error && <MessageBox type="error" message={`Грешка: ${error}`} />}
      {success && <MessageBox type="success" message="Категорията беше редактирана успешно!" />}

      <legend>Редактирай категория</legend>

      <form
        className={styles.registerForm}
        onSubmit={(e) =>
          handleSubmit(
            e,
            formValues,
            setFormValues,
            setSuccess,
            setError,
            setInvalidFields,
            handleEditSubmit,
            [
              (values) => {
                const name = sanitizeText(values.name);
                if (name.length < 2) {
                  return {
                    fields: ['name'],
                    message: 'Името трябва да съдържа поне 2 символа.',
                  };
                }
                return null;
              },
            ]
          )
        }
      >
        <label htmlFor="name">Име на категория</label>
        <input
          type="text"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          className={invalidFields.includes('name') ? styles.invalidField : ''}
        />

        <button type="submit">Запази</button>
      </form>
    </div>
  );
}
