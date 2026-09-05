function extractErrorMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((e) => e.message || e.msg).join(', ');
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export default extractErrorMessage;
