import baseURL from '@/config';
import { createResponseError, readResponseJsonSafely } from '@/utils/errorHandler';

export async function onCreateCategorySubmit(
  formValues,
  setSuccess,
  setError,
  setInvalidFields,
  router,
  triggerCategoriesReload
) {
  try {
    const res = await fetch(`${baseURL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formValues),
    });

    const result = await readResponseJsonSafely(res);

    if (!res.ok) {
      throw createResponseError(
        result?.message || 'Възникна грешка при създаване на категория.',
        result
      );
    }

    setSuccess(true);
    triggerCategoriesReload(); 
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
