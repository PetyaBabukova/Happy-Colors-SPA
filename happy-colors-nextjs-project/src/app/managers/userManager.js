export const onRegisterSubmit = async (formValues, setSuccess, setError, setInvalidFields) => {
    try {
      const res = await fetch('http://localhost:3030/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        // Пример: backend връща { message: "...", field: "email" }
        throw result;
      }
  
      setSuccess(true);
      setError('');
      setInvalidFields([]);
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
  

  export const onLoginSubmit = async (formValues, setSuccess, setError) => {
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
  
      setSuccess(true);
      setError('');
    } catch (err) {
      console.error('Login error:', err.message);
      setSuccess(false);
      setError('Невалиден e-mail или парола');
    }
  };
  
  export const onLogoutSubmit = async (setSuccess, setError) => {
    try {
      const res = await fetch('http://localhost:3030/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
  
      if (!res.ok) {
        throw new Error('Грешка при изход');
      }
  
      setSuccess(true);
      setError('');
    } catch (err) {
      console.error('Logout error:', err.message);
      setSuccess(false);
      setError('Неуспешен изход');
    }
  };
  
  