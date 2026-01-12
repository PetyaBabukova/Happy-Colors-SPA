// happy-colors-nextjs-project/src/components/products/ProductForm.jsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useForm from '@/hooks/useForm';
import { handleSubmit } from '@/utils/formSubmitHelper';
import MessageBox from '@/components/ui/MessageBox';
import { useProducts } from '@/context/ProductContext';
import styles from './create.module.css';
import { uploadImageToBucket } from '@/managers/uploadManager';

export default function ProductForm({ initialValues, onSubmit, legendText, successMessage }) {
  const router = useRouter();
  const { categories } = useProducts();

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

    // ✅ НОВО: наличност (default)
    availability: 'available',
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    if (initialValues) {
      // ✅ ако стар продукт няма availability (стари записи) → default 'available'
      setFormValues({
        availability: 'available',
        ...initialValues,
        availability: initialValues.availability || 'available',
      });
    }
  }, [initialValues, setFormValues]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Моля, качете само файлове от тип изображение.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Файлът е твърде голям. Максимален размер: 5 MB.');
      return;
    }

    try {
      setUploading(true);

      const imageUrl = await uploadImageToBucket(file);

      setFormValues((prev) => ({
        ...prev,
        imageUrl,
      }));
    } catch (err) {
      console.error(err);
      setUploadError('Възникна грешка при качването на изображението.');
    } finally {
      setUploading(false);
    }
  };

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

        {/* ✅ НОВО: Наличност */}
        <label htmlFor="availability">Наличност</label>
        <select
          name="availability"
          value={formValues.availability || 'available'}
          onChange={handleChange}
          className={invalidFields.includes('availability') ? styles.invalidField : ''}
        >
          <option value="available">Продукта е наличен и можете да го поръчате</option>
          <option value="unavailable">Продукта не е наличен, ако желаете пратете запитване</option>
        </select>

        <label>Изображение</label>
        <input
          type="file"
          name="imageUrl"
          onChange={handleFileChange}
          accept="image/*"
          className={invalidFields.includes('imageUrl') ? styles.invalidField : ''}
        />
        {uploading && <p className={styles.fieldHint}>Качване на изображението...</p>}
        {invalidFields.imageUrl && (
          <p className={styles.fieldHint}>Моля изберете изображение.</p>
        )}
        {uploadError && (
          <p className={styles.fieldHint}>{uploadError}</p>
        )}

        <button type="submit">Запази</button>
      </form>
    </div>
  );
}
