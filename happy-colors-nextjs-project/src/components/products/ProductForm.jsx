'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useForm from '@/hooks/useForm';
import { handleSubmit } from '@/utils/formSubmitHelper';
import MessageBox from '@/components/ui/MessageBox';
import { useProducts } from '@/context/ProductContext'; // 🟢 ново
import styles from './create.module.css';

export default function ProductForm({ initialValues, onSubmit, legendText, successMessage }) {
  const router = useRouter();
  const { categories } = useProducts(); // 🟢 взимаме всички категории от контекста

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
  } = useForm({
    title: '',
    description: '',
    category: '',
    price: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (initialValues) {
      setFormValues(initialValues);
    }
  }, [initialValues, setFormValues]);

  return (
    <div className={styles.registerFormContainer}>
      {error && <MessageBox type="error" message={`Грешка: ${error}`} />}
      {success && <MessageBox type="success" message={successMessage || 'Успешно изпълнение'} />}

      <legend>{legendText}</legend>

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
            (values, setSuccess, setError, setInvalidFields) =>
              onSubmit(values, setSuccess, setError, setInvalidFields, router)
          )
        }
      >
        <label htmlFor="title">Име на продукта</label>
        <input
          name="title"
          value={formValues.title}
          onChange={handleChange}
          className={invalidFields.includes('title') ? styles.invalidField : ''}
        />

        <label htmlFor="description">Описание</label>
        <input
          name="description"
          value={formValues.description}
          onChange={handleChange}
          className={invalidFields.includes('description') ? styles.invalidField : ''}
        />

        <label htmlFor="category">Категория</label>
        <select
          name="category"
          value={formValues.category}
          onChange={handleChange}
          className={invalidFields.includes('category') ? styles.invalidField : ''}
        >
          <option value="">-- Изберете категория --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <label htmlFor="price">Цена</label>
        <input
          type="number"
          name="price"
          value={formValues.price}
          onChange={handleChange}
          className={invalidFields.includes('price') ? styles.invalidField : ''}
        />

        <label htmlFor="imageUrl">Изображение (URL)</label>
        <input
          name="imageUrl"
          value={formValues.imageUrl}
          onChange={handleChange}
          className={invalidFields.includes('imageUrl') ? styles.invalidField : ''}
        />

        <button type="submit">Запази</button>
      </form>
    </div>
  );
}
