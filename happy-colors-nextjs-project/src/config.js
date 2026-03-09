// src/config.js

const baseURL =
  process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_API_URL || 'https://happycolors.com')
    : 'http://localhost:3030';

export default baseURL;