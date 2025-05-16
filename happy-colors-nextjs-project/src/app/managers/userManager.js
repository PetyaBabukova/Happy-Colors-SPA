import { extractErrorMessage } from '@/utils/errorHandler';

export const onRegisterSubmit = async (formValues, setSuccess, setError) => {
  try {
    const res = await fetch('http://localhost:3030/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Неуспешна регистрация!');
    }

    setSuccess(true);
    setError('');
  } catch (err) {
    const message = extractErrorMessage(err);
    setError(message);
    setSuccess(false);
    console.error('Грешка при регистрация:', message);
  }
};
