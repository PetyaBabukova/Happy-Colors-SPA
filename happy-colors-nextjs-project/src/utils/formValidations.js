// Проверява за празни полета
export function validateEmptyFields(formValues) {
  return Object.entries(formValues)
    .filter(([_, value]) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      return false; // напр. ако е число или булев, не го третираме като празно
    })
    .map(([key]) => key);
}


// Валидира съвпадение на пароли
export function passwordsMatchValidator(values) {
  if (values.password !== values.repeatPassword) {
    return {
      fields: ['password', 'repeatPassword'],
      message: 'Паролите не съвпадат!',
    };
  }
  return null;
}

// Проверка за email формат
export function validateEmailFormat(values) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(String(values.email).trim())) {
    return {
      fields: ['email'],
      message: 'Невалиден e-mail формат!',
    };
  }
  return null;
}

// Премахва HTML тагове
export function sanitizeText(input) {
  return String(input).replace(/<\/?[^>]+(>|$)/g, '').trim();
}

// Валидира число (напр. цена)
export function validatePrice(values) {
  const price = Number(values.price);
  if (isNaN(price) || price <= 0) {
    return {
      fields: ['price'],
      message: 'Моля въведете валидна цена над 0.',
    };
  }
  return null;
}

// Валидира imageUrl да е URL
export function validateImageUrl(values) {
  try {
    const url = new URL(values.imageUrl);
    if (!/^https?:/.test(url.protocol)) {
      throw new Error();
    }
    return null;
  } catch {
    return {
      fields: ['imageUrl'],
      message: 'Моля въведете валиден URL адрес на изображение.',
    };
  }
}
