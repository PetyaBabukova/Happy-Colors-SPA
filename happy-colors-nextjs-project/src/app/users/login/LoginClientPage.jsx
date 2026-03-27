'use client';

import styles from './login.module.css';
import { useEffect } from 'react';
import MessageBox from '@/components/ui/MessageBox';
import { onLoginSubmit } from '@/managers/userManager';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import useForm from '@/hooks/useForm';

export default function LoginClientPage() {
  const { setUser } = useAuth();
  const router = useRouter();

  const {
    formValues,
    error,
    setError,
    success,
    setSuccess,
    handleChange,
  } = useForm({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLoginSubmit(formValues, setSuccess, setError, setUser);
  };

  useEffect(() => {
    if (success) {
      router.push('/products');
    }
  }, [success, router]);

  return (
    <fieldset className={styles.registerFormContainer}>
      {error && <MessageBox type="error" message={error} />}
      {success && <MessageBox type="success" message={success} />}

      <legend>Login</legend>

      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formValues.password}
          onChange={handleChange}
        />

        <button type="submit">Login</button>
      </form>
    </fieldset>
  );
}