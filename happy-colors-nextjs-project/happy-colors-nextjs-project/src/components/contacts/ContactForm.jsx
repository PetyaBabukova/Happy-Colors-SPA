'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useForm from '@/hooks/useForm';
import MessageBox from '@/components/ui/MessageBox';
import {
  validateEmptyFields,
  validateContactForm,
  validateContactLength,
} from '@/utils/formValidations';
import { sendContactForm } from '../../managers/contactsManager';
import styles from '../../components/products/create.module.css';

const initialValues = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export default function ContactForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId'); // очакваме ?productId=...

  const {
    formValues,
    error,
    setError,
    success,
    setSuccess,
    invalidFields,
    setInvalidFields,
    handleChange,
    resetForm,
  } = useForm(initialValues);

  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (notificationMessage && notificationType === 'success') {
      const timer = setTimeout(() => {
        setNotificationMessage('');
        setNotificationType(null);
        router.push('/products');
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (notificationMessage && notificationType === 'error') {
      const timer = setTimeout(() => {
        setNotificationMessage('');
        setNotificationType(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notificationMessage, notificationType, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emptyFields = validateEmptyFields(formValues);
    if (emptyFields.length > 0) {
      setInvalidFields(emptyFields);
      setError('Моля попълнете всички задължителни полета');
      return;
    }

    const lengthErrors = validateContactLength(formValues);
    if (lengthErrors.length > 0) {
      setInvalidFields(lengthErrors);
      setError('Моля проверете дължината и формата на въведените данни');
      return;
    }

    const { sanitizedValues, hasForbiddenChars } = validateContactForm(formValues);

    if (hasForbiddenChars) {
      setError('Използване на забранени символи!');
      return;
    }

    // ✅ ако идва от продукт → пращаме и URL (по-надеждно от само ID)
    const payload = {
      ...sanitizedValues,
      productId: productId || null,
      productUrl: productId ? `${window.location.origin}/products/${productId}` : null,
    };

    try {
      await sendContactForm(payload);

      setSuccess(true);
      setNotificationMessage('Благодарим! Ще се свържем с вас при първа възможност.');
      setNotificationType('success');
      resetForm();
    } catch (err) {
      setNotificationMessage(
        'Възникна грешка, съобщението ви не е изпратено. Моля опитайте по-късно.'
      );
      setNotificationType('error');
    }
  };

  return (
    <div className={styles.registerFormContainer}>
      {notificationMessage ? (
        <MessageBox type={notificationType} message={notificationMessage} />
      ) : error ? (
        <MessageBox type="error" message={error} />
      ) : success ? (
        <MessageBox type="success" message="Съобщението беше изпратено успешно!" />
      ) : null}

      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <label htmlFor="name">
          Име<span className={styles.red}>*</span>
        </label>
        <input
          id="name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          className={invalidFields.includes('name') ? styles.invalidField : ''}
        />
        <p className={styles.fieldHint}>Името трябва да е с дължина от 3 до 20 символа</p>

        <label htmlFor="email">
          Имейл<span className={styles.red}>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          className={invalidFields.includes('email') ? styles.invalidField : ''}
        />
        <p className={styles.fieldHint}>Моля въведете валиден email адрес</p>

        <label htmlFor="phone">Телефон</label>
        <input
          id="phone"
          name="phone"
          type="text"
          value={formValues.phone}
          onChange={handleChange}
          className={invalidFields.includes('phone') ? styles.invalidField : ''}
        />

        <label htmlFor="message">
          Съобщение<span className={styles.red}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows="6"
          value={formValues.message}
          onChange={handleChange}
          className={invalidFields.includes('message') ? styles.invalidField : ''}
          // ✅ ВРЪЩАМЕ ТВОЯ СТИЛ, за да има рамка както преди
          style={{
            padding: '0.5rem',
            border: '1px solid var(--dark-green)',
            borderRadius: '5px',
            fontSize: '1rem',
            marginBottom: '0.5em',
            fontFamily: 'inherit',
          }}
        />
        <p className={styles.fieldHint}>Съобщението ви не трябва да превишава 200 символа</p>

        <button type="submit">Изпрати</button>
      </form>
    </div>
  );
}
