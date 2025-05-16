'use client';
import React, { useState, useEffect } from 'react';
import styles from './login.module.css';
import { onLoginSubmit } from '../../managers/userManager';
import MessageBox from '@/components/ui/MessageBox';

export default function Login() {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formValues.email || !formValues.password) {
      setError('Моля попълнете всички полета!');
      setSuccess(false);
      return;
    }

    onLoginSubmit(formValues, setSuccess, setError);
  };

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
      {error && <MessageBox type="error" message={`Невалиден e-mail или парола`} />}
      {success && <MessageBox type="success" message="Успешно влизане!" />}
      <legend>Login</legend>

      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input name="email" value={formValues.email} onChange={handleChange} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" value={formValues.password} onChange={handleChange} />

        <button>Login</button>
      </form>
    </div>
  );
}
