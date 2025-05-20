'use client';
import styles from './login.module.css';
import MessageBox from '@/components/ui/MessageBox';
import { onLoginSubmit } from '@/managers/userManager';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import useForm from '@/hooks/useForm';

export default function Login() {
  const { setUser } = useAuth();
  const router = useRouter();

  const {
    formValues,
    setFormValues,
    error,
    setError,
    success,
    setSuccess,
    handleChange
  } = useForm({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLoginSubmit(formValues, setSuccess, setError, setUser);
  };

  if (success) router.push('/products');

  return (
    <div className={styles.registerFormContainer}>
      {error && <MessageBox type="error" message="Невалиден e-mail или парола" />}
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