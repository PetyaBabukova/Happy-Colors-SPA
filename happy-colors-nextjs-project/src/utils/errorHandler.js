export function extractErrorMessage(err) {
  if (err.response && err.response.data?.message) {
    return err.response.data.message;
  }

  if (err.message) {
    return err.message;
  }

  return 'Възникна неизвестна грешка.';
}

export async function readResponseJsonSafely(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function createResponseError(message, data = null) {
  const error = new Error(message);

  if (data && typeof data === 'object') {
    Object.assign(error, data);
  }

  return error;
}
