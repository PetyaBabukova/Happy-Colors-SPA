//happy-colors-nextjs-project/src/components/products/ProductForm.jsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useForm from '@/hooks/useForm';
import { handleSubmit } from '@/utils/formSubmitHelper';
import MessageBox from '@/components/ui/MessageBox';
import { useProducts } from '@/context/ProductContext';
import styles from './create.module.css';
import { uploadImagesToBucket } from '@/managers/uploadManager';
import { deleteProductImage } from '@/managers/productsManager';

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
    imageUrls: [],
    availability: 'available',
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    if (initialValues) {
      const normalizedImageUrls = Array.isArray(initialValues.imageUrls)
        ? initialValues.imageUrls.filter(Boolean)
        : initialValues.imageUrl
        ? [initialValues.imageUrl]
        : [];

      setFormValues({
        title: '',
        description: '',
        category: '',
        price: '',
        imageUrl: '',
        imageUrls: [],
        availability: 'available',
        ...initialValues,
        imageUrls: normalizedImageUrls,
        imageUrl: normalizedImageUrls[0] || initialValues.imageUrl || '',
        availability: initialValues.availability || 'available',
      });
    }
  }, [initialValues, setFormValues]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    setUploadError(null);

    const hasInvalidType = selectedFiles.some((file) => !file.type.startsWith('image/'));
    if (hasInvalidType) {
      setUploadError('Моля, качете само файлове от тип изображение.');
      return;
    }

    const hasOversizedFile = selectedFiles.some((file) => file.size > MAX_FILE_SIZE);
    if (hasOversizedFile) {
      setUploadError('Един или повече файлове са твърде големи. Максимален размер: 5 MB.');
      return;
    }

    try {
      setUploading(true);

      const uploadedImageUrls = await uploadImagesToBucket(selectedFiles);

      setFormValues((prev) => {
        const currentImageUrls = Array.isArray(prev.imageUrls)
          ? prev.imageUrls.filter(Boolean)
          : prev.imageUrl
          ? [prev.imageUrl]
          : [];

        const mergedImageUrls = [...new Set([...currentImageUrls, ...uploadedImageUrls])];

        return {
          ...prev,
          imageUrls: mergedImageUrls,
          imageUrl: mergedImageUrls[0] || '',
        };
      });

      e.target.value = '';
    } catch (err) {
      console.error(err);
      setUploadError('Възникна грешка при качването на изображенията.');
    } finally {
      setUploading(false);
    }
  };

  const hasImages = Array.isArray(formValues.imageUrls) && formValues.imageUrls.length > 0;

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

        <label>Изображения</label>
        <input
          type="file"
          name="imageUrls"
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className={
            invalidFields.includes('imageUrl') || invalidFields.includes('imageUrls')
              ? styles.invalidField
              : ''
          }
        />

        <p className={styles.fieldHint}>
          {hasImages
            ? 'Изберете още изображения, за да ги добавите към вече качените.'
            : 'Можете да качите едно или няколко изображения.'}
        </p>

        {uploading && <p className={styles.fieldHint}>Качване на изображенията...</p>}

        {(invalidFields.includes('imageUrl') || invalidFields.includes('imageUrls')) && (
          <p className={styles.fieldHint}>Моля изберете поне едно изображение.</p>
        )}

        {uploadError && <p className={styles.fieldHint}>{uploadError}</p>}

        {hasImages && (
          <div className={styles.uploadedImagesPreview}>
            <p className={styles.fieldHint}>
              Текущи изображения: {formValues.imageUrls.length}
            </p>

            <ul>
              {formValues.imageUrls.map((url, index) => (
                <li key={`${url}-${index}`} className={styles.imagePreviewItem}>
                  <span>Изображение {index + 1}</span>

                  {formValues.imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (!initialValues?._id) return;

                          await deleteProductImage(initialValues._id, url);

                          setFormValues((prev) => {
                            const updated = prev.imageUrls.filter((img) => img !== url);

                            return {
                              ...prev,
                              imageUrls: updated,
                              imageUrl: updated[0] || '',
                            };
                          });
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                    >
                      ❌
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit">Запази</button>
      </form>
    </div>
  );
}