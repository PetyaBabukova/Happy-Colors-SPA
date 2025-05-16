'use client';
import React, { useState, useEffect } from 'react';
import styles from './register.module.css';
import { onRegisterSubmit } from '../../managers/userManager';
import MessageBox from '@/components/ui/MessageBox';
import { handleChange, handleSubmit } from '@/helpers/userHelpers';

export default function Register() {
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className={styles.registerFormContainer}>
      {error && <MessageBox type="error" message={`Неуспешна регистрация: ${error}`} />}
      {success && <MessageBox type="success" message="Регистрирахте се успешно" />}
      <legend>Регистрация</legend>

      <form className={styles.registerForm} onSubmit={(e) => 
  handleSubmit(e, formValues, setFormValues, setSuccess, setError, setInvalidFields, onRegisterSubmit)
}>
        <label htmlFor="username">Username</label>
        <input
          name="username"
          value={formValues.username}
          onChange={(e) => handleChange(e, setFormValues)}
          className={invalidFields.includes('username') ? styles.invalidField : ''}
        />

        <label htmlFor="email">Email</label>
        <input
          name="email"
          value={formValues.email}
          onChange={(e) => handleChange(e, setFormValues)}
          className={invalidFields.includes('email') ? styles.invalidField : ''}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          value={formValues.password}
          onChange={(e) => handleChange(e, setFormValues)}
          className={invalidFields.includes('password') ? styles.invalidField : ''}
        />

        <label htmlFor="repeatPassword">Repeat Password</label>
        <input
          type="password"
          name="repeatPassword"
          value={formValues.repeatPassword}
          onChange={(e) => handleChange(e, setFormValues)}
          className={invalidFields.includes('repeatPassword') ? styles.invalidField : ''}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
