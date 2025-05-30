'use client';
import useForm from '@/hooks/useForm';
import { handleSubmit } from '@/utils/formSubmitHelper';
import { sanitizeText } from '@/utils/formValidations';
import { onCreateCategorySubmit } from '@/managers/categoriesManager';
import MessageBox from '@/components/ui/MessageBox';

import styles from '../products/create.module.css'; // 🟢 ползваме същия CSS

export default function CreateCategory() {
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

  return (
    <div className={styles.registerFormContainer}>
      {error && <MessageBox type="error" message={`Грешка: ${error}`} />}
      {success && (
        <MessageBox type="success" message="Категорията беше създадена успешно!" />
      )}

      <legend>Създай нова категория</legend>

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
            onCreateCategorySubmit,
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

        <button type="submit">Създай</button>
      </form>
    </div>
  );
}