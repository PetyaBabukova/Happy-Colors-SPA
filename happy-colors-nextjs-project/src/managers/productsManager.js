import baseURL from '@/config';

export async function onCreateProductSubmit(
  formValues,
  setSuccess,
  setError,
  setInvalidFields,
  user,
  router
) {
  try {
    const res = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...formValues,
        owner: user._id,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    setSuccess(true);
    setError('');
    setInvalidFields([]);
    router.push(`/products/${result._id}`);
  } catch (err) {
    setSuccess(false);
    setError(err.message || 'Възникна грешка при създаване на продукт.');

    if (err.field) {
      setInvalidFields([err.field]);
    } else {
      setInvalidFields([]);
    }
  }
}

export async function onEditProductSubmit(
  formValues,
  setSuccess,
  setError,
  setInvalidFields,
  user,
  router,
  productId
) {
  try {
    const res = await fetch(`${baseURL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
    router.push(`/products/${productId}`);
  } catch (err) {
    setSuccess(false);
    setError(err.message || 'Възникна грешка при редакция на продукта.');

    if (err.field) {
      setInvalidFields([err.field]);
    } else {
      setInvalidFields([]);
    }
  }
}
