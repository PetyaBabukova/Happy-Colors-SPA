'use client';

import useForm from '@/hooks/useForm';
import MessageBox from '@/components/ui/MessageBox';
import { validateContactForm } from '@/utils/formValidations';
import { extractErrorMessage } from '@/utils/errorHandler';
import { sendContactForm } from '../../managers/contactsManager';
import styles from '../../components/products/create.module.css';

const initialValues = {
  name: '',
  email: '', 
  phone: '',
  message: '',
};

export default function ContactForm() {
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
    resetForm,
  } = useForm(initialValues);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { sanitizedValues, emptyFields, hasForbiddenChars } =
      validateContactForm(formValues);

    if (emptyFields.length > 0) {
      setInvalidFields(emptyFields);
      setError('Моля попълнете всички задължителни полета');
      return;
    }

    if (hasForbiddenChars) {
      setError('Използване на забранени символи!');
      return;
    }

    try {
      await sendContactForm(sanitizedValues);
      setSuccess(true);
      resetForm();
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
    }
  };

  return (
    <div className={styles.registerFormContainer}>
      {error && <MessageBox type="error" message={error} />}
      {success && (
        <MessageBox type="success" message="Съобщението беше изпратено успешно!" />
      )}

      {/* <legend>Задайте ни въпрос</legend> */}

      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <label htmlFor="name">Име<span className={styles.red}>*</span></label>
        <input
          id="name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          className={invalidFields.includes('name') ? styles.invalidField : ''}
        />

        <label htmlFor="email">Имейл<span className={styles.red}>*</span></label>
        <input
          id="email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          className={invalidFields.includes('email') ? styles.invalidField : ''}
        />

        <label htmlFor="email">Телефон</label>
        <input
          id="phone"
          name="phone"
          type="phone"
          value={formValues.phone}
          onChange={handleChange}
          className={invalidFields.includes('phone') ? styles.invalidField : ''}
        />

        <label htmlFor="message">Съобщение<span className={styles.red}>*</span></label>
        <textarea
          id="message"
          name="message"
          rows="6"
          value={formValues.message}
          onChange={handleChange}
          className={invalidFields.includes('message') ? styles.invalidField : ''}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--dark-green)',
            borderRadius: '5px',
            fontSize: '1rem',
            marginBottom: '0.5em',
            fontFamily: 'inherit',
          }}
        />

        <button type="submit">Изпрати</button>
      </form>
    </div>
  );
}
