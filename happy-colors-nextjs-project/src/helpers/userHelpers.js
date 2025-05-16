export function handleChange(e, setFormValues) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }
  
  export function handleSubmit(e, formValues, setFormValues, setSuccess, setError, setInvalidFields, onSubmitFn) {
    e.preventDefault();
  
    const emptyFields = Object.entries(formValues)
      .filter(([_, value]) => value.trim() === '')
      .map(([key]) => key);
  
    if (emptyFields.length > 0) {
      setInvalidFields(emptyFields);
      setError('Моля попълнете всички задължителни полета!');
      setSuccess(false);
      return;
    }
  
    if (formValues.password !== formValues.repeatPassword) {
      setInvalidFields(['password', 'repeatPassword']);
      setError('Паролите не съвпадат!');
      setSuccess(false);
      return;
    }
  
    const cleanedValues = { ...formValues };
    emptyFields.forEach((field) => {
      cleanedValues[field] = '';
    });
    setFormValues(cleanedValues);
  
    onSubmitFn(formValues, setSuccess, setError, setInvalidFields);
  }
  