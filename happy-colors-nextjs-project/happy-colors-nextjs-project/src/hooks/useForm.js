// happy-colors-nextjs-project/src/hooks/useForm.js

import { useState, useEffect } from 'react';

export default function useForm(initialValues = {}) {
  const [formValues, setFormValues] = useState(initialValues);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);

  // Автоматично нулиране на съобщенията след време
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Хелпър функция за нулиране на формата (ако е нужно след submit)
  const resetForm = () => {
    setFormValues(initialValues);
    setInvalidFields([]);
    setError('');
    setSuccess(false);
  };

  return {
    formValues,
    setFormValues,
    error,
    setError,
    success,
    setSuccess,
    invalidFields,
    setInvalidFields,
    handleChange,
    resetForm,
  };
}
