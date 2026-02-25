export function extractErrorMessage(err) {
    if (err.response && err.response.data?.message) {
      return err.response.data.message;
    }
  
    if (err.message) {
      return err.message;
    }
  
    return 'Възникна неизвестна грешка.';
  }
  