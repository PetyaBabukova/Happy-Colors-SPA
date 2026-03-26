// src/config.js
// Конфигурационен файл за определяне на API адресите на клиента.
// Използва process.env.NODE_ENV вместо неправилното 'process.ezv'.
// В production се използва стойността от NEXT_PUBLIC_API_URL, ако е дефинирана.
// В противен случай падаме към 'https://happycolors.com'. В development
// се използва локалния бекенд на порт 3030.

const baseURL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL || 'https://happycolors.com'
    : 'http://localhost:3030';

export default baseURL;