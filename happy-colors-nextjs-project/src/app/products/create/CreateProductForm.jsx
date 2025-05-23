'use client';

import styles from './create.module.css';
import { useRouter } from 'next/navigation';
import MessageBox from '@/components/ui/MessageBox';
import useForm from '@/hooks/useForm';
import { handleSubmit } from '@/utils/formSubmitHelper';
import { useAuth } from '@/context/AuthContext';
import { onCreateProductSubmit } from '@/managers/productsManager';

export default function CreateProductForm() {
  const router = useRouter();
  const { user } = useAuth();

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

  return (
    <div className={styles.registerFormContainer}>
      {error && <MessageBox type="error" message={`Грешка: ${error}`} />}
      {success && <MessageBox type="success" message="Продуктът беше създаден успешно!" />}

      <legend>Създаване на нов продукт</legend>

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
              onCreateProductSubmit(values, setSuccess, setError, setInvalidFields, user, router)
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
        <input
          name="category"
          value={formValues.category}
          onChange={handleChange}
          className={invalidFields.includes('category') ? styles.invalidField : ''}
        />

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

        <button type="submit">Създай продукт</button>
      </form>
    </div>
  );
}
