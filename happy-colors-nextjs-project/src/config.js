// src/config.js

const isServer = typeof window === 'undefined';

// Optional override — not part of the default path
const explicitOverride = process.env.NEXT_PUBLIC_API_URL?.trim();

let baseURL;

if (explicitOverride) {
  baseURL = explicitOverride;
} else if (isServer) {
  const port = process.env.PORT || '3000';
  baseURL = `http://localhost:${port}/api`;
} else {
  baseURL = '/api';
}

export default baseURL;
