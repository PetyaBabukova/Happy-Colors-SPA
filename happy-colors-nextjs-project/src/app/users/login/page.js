'use client';
import { useState, useEffect } from 'react';
import styles from './login.module.css';
import { onLoginSubmit } from '../../managers/userManager';
import MessageBox from '@/components/ui/MessageBox';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { handleChange } from '@/helpers/userHelpers';

export default function Login() {
  const { setUser } = useAuth();
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValues.email || !formValues.password) {
      setError('Моля попълнете всички полета!');
      setSuccess(false);
      return;
    }

    await onLoginSubmit(formValues, setSuccess, setError, setUser);
  };

  useEffect(() => {
    if (success) {
      router.push('/products');
    }
  }, [success, router]);

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
      {error && <MessageBox type="error" message="Невалиден e-mail или парола" />}
      {success && <MessageBox type="success" message="Успешно влизане!" />}
      <legend>Login</legend>

      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input name="email" value={formValues.email} onChange={(e) => handleChange(e, setFormValues)} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" value={formValues.password} onChange={(e) => handleChange(e, setFormValues)} />

        <button>Login</button>
      </form>
    </div>
  );
}
