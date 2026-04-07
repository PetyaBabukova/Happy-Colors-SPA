const isServer = typeof window === 'undefined';

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function getExplicitApiOverride() {
  const rawValue = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!rawValue) {
    return '';
  }

  const normalizedValue = stripTrailingSlash(rawValue);

  if (normalizedValue === '/api' || normalizedValue.endsWith('/api')) {
    return normalizedValue;
  }

  return '';
}

const explicitOverride = getExplicitApiOverride();

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
