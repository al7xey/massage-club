interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
}

export function getApiErrorMessage(error: unknown, fallback = 'Не удалось выполнить запрос') {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeStatusError = error as {
      data?: ApiErrorPayload | string;
      error?: string;
      status?: number | string;
    };

    if (typeof maybeStatusError.data === 'string' && maybeStatusError.data) {
      return maybeStatusError.data;
    }

    if (typeof maybeStatusError.data === 'object' && maybeStatusError.data !== null) {
      if (Array.isArray(maybeStatusError.data.message)) {
        return maybeStatusError.data.message.join(', ');
      }

      if (typeof maybeStatusError.data.message === 'string' && maybeStatusError.data.message) {
        return maybeStatusError.data.message;
      }
    }

    if (typeof maybeStatusError.error === 'string' && maybeStatusError.error) {
      return maybeStatusError.error;
    }
  }

  return fallback;
}
