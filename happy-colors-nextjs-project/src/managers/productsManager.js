import baseURL from '@/config';

export const onCreateProductSubmit = async (
  formValues,
  setSuccess,
  setError,
  setInvalidFields,
  user,
  router
) => {
  try {
    const res = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...formValues,
        owner: user?._id, // добавяме owner полето за валидирането в модела
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    setSuccess(true);
    setError('');
    setInvalidFields([]);

    router.push('/products'); // или към детайлите на новия продукт
  } catch (err) {
    setSuccess(false);
    setError(err.message || 'Възникна грешка при създаване на продукт');

    if (err.field) {
      setInvalidFields([err.field]);
    } else {
      setInvalidFields([]);
    }
  }
};
