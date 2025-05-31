import baseURL from '@/config';

export async function onCreateCategorySubmit(
  formValues,
  setSuccess,
  setError,
  setInvalidFields,
  router // 🟢 получава се от компонента
) {
  try {
    const res = await fetch(`${baseURL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formValues),
    });

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    setSuccess(true);
    setError('');
    setInvalidFields([]);

    // 🟢 Редирект към формата за създаване на продукт
    router.push('/products/create');
  } catch (err) {
    setSuccess(false);
    setError(err.message || 'Възникна грешка при създаване на категория.');
    if (err.field) {
      setInvalidFields([err.field]);
    } else {
      setInvalidFields([]);
    }
  }
}
