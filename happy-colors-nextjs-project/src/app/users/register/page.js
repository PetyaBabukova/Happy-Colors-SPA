'use client';
import React, { useState } from 'react';
import styles from './register.module.css';
import { onRegisterSubmit } from '../../managers/userManager';
import MessageBox from '@/components/ui/MessageBox';

export default function Register() {
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for password mismatch
    if (formValues.password !== formValues.repeatPassword) {
      setError('Паролите не съвпадат!');
      setSuccess(false);
      return;
    }

    onRegisterSubmit(formValues, setSuccess, setError);
  };

  return (
    <div className={styles.registerFormContainer}>
      
      {error && <MessageBox type="error" message={`Неуспешна регистрация: ${error}`} />}
      {success && <MessageBox type="success" message="Регистрирахте се успешно" />}
      <legend>Регистрация</legend>


      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input 
        name="username" 
        value={formValues.username} 
        onChange={handleChange}
         />

        <label htmlFor="email">Email</label>
        <input name="email" value={formValues.email} onChange={handleChange} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" value={formValues.password} onChange={handleChange} />

        <label htmlFor="repeatPassword">Repeat Password</label>
        <input
          type="password"
          name="repeatPassword"
          value={formValues.repeatPassword}
          onChange={handleChange}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
