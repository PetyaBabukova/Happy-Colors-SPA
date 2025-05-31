import baseURL from '@/config';

export async function onCreateProductSubmit(
  formValues,
  setSuccess,
  setError,
  setInvalidFields,
  user,
  router,
  triggerCategoriesReload // 🟢 ново
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

    triggerCategoriesReload(); // 🟢 презареждаме категориите за Header

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

export async function getProducts(categoryName) {
  try {
    let url = `${baseURL}/products`;

    if (categoryName && categoryName !== 'Всички') {
      url += `?category=${encodeURIComponent(categoryName)}`;
    }

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Неуспешно зареждане на продуктите');
    }

    return await res.json();
  } catch (err) {
    console.error(err.message);
    return [];
  }
}

