// src/config.js
const envApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_BASE_URL?.trim();

const baseURL =
  process.env.NODE_ENV === 'production'
    ? envApiUrl || 'https://happycolors.eu'
    : envApiUrl || 'http://localhost:3030';

export default baseURL;