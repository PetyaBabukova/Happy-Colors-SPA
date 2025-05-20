// Проверява за празни полета
export function validateEmptyFields(formValues) {
    return Object.entries(formValues)
      .filter(([_, value]) => value.trim() === '')
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
    if (!regex.test(values.email)) {
      return {
        fields: ['email'],
        message: 'Невалиден e-mail формат!',
      };
    }
    return null;
  }
  
  // Премахва HTML тагове
  export function sanitizeText(input) {
    return input.replace(/<\/?[^>]+(>|$)/g, '').trim();
  }
  