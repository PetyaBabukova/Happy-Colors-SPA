import { useAuth } from '@/context/AuthContext';


export const onRegisterSubmit = async (
  formValues,
  setSuccess,
  setError,
  setInvalidFields,
  setUser
) => {
  try {
    const res = await fetch('http://localhost:3030/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues),
    });

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    setError('');
    setInvalidFields([]);

    await onLoginSubmit(
      { email: formValues.email, password: formValues.password },
      () => {},
      () => {},
      setUser
    );

    // ✅ Сега вече всичко е готово – логваме, тогава success
    setSuccess(true);

  } catch (err) {
    setSuccess(false);
    setError(err.message || 'Възникна грешка.');
    if (err.field) {
      setInvalidFields([err.field]);
    } else {
      setInvalidFields([]);
    }
  }
};


  export const onLoginSubmit = async (formValues, setSuccess, setError, setUser) => {
    try {
      const res = await fetch('http://localhost:3030/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formValues),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        throw new Error(result.message);
      }
  
      // 🔥 директно сетваш user
      if (typeof setUser === 'function') {
        setUser({
          username: result.username,
          _id: result._id,
          email: result.email
        });
      }
  
      setSuccess(true);
      setError('');
    } catch (err) {
      console.error('Login error:', err.message);
      setSuccess(false);
      setError('Невалиден e-mail или парола');
    }
  };
  
    export const logoutUser = async (setUser, router, setError = () => {}) => {
    try {
      const res = await fetch('http://localhost:3030/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
  
      if (!res.ok) {
        throw new Error('Грешка при изход');
      }
  
      if (typeof setUser === 'function') {
        setUser(null); // 🧹 изчистваме потребителя от контекста
      }
  
      router.push('/'); // 🔁 пренасочваме към началната страница
    } catch (err) {
      console.error('Logout error:', err.message);
      setError('Неуспешен изход');
    }
  };
  
