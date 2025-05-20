import { validateEmptyFields } from './formValidations.js';

export function handleSubmit(
  e,
  formValues,
  setFormValues,
  setSuccess,
  setError,
  setInvalidFields,
  onSubmitFn,
  customValidators = []
) {
  e.preventDefault();

  const emptyFields = validateEmptyFields(formValues);

  if (emptyFields.length > 0) {
    setInvalidFields(emptyFields);
    setError('Моля попълнете всички задължителни полета!');
    setSuccess(false);
    return;
  }

  for (const validator of customValidators) {
    const result = validator(formValues);
    if (result) {
      const { fields = [], message } = result;
      setInvalidFields(fields);
      setError(message || 'Невалидни стойности!');
      setSuccess(false);
      return;
    }
  }

  setInvalidFields([]);
  setError('');
  setSuccess(false);

  onSubmitFn(formValues, setSuccess, setError, setInvalidFields);
}
    