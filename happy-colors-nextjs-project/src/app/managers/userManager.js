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
  