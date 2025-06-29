const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not defined!');
  throw new Error('API URL is not configured');
}

// Общая функция для обработки HTTP-ответов
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    const errorMsg = errorData?.error || 'Ошибка сервера';
    throw new Error(errorMsg);
  }
  return response.json();
}

export const phoneApi = {
  // Получить все номера
  fetchPhones: async () => {
    const response = await fetch(`${API_URL}/phones`);
    return handleResponse(response);
    },

  // Добавить новый номер
  addPhone: async (phoneData) => {
    const response = await fetch(`${API_URL}/phones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phoneData)
    });
    return handleResponse(response);
  },

  // Удалить номер
  deletePhone: async (id) => {
    const response = await fetch(`${API_URL}/phones/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};