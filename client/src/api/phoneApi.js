const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not defined!');
  throw new Error('API URL is not configured');
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    const errorMsg = errorData?.error || 'Ошибка сервера';
    throw new Error(errorMsg);
  }
  return response.json();
}

export const phoneApi = {
  async fetchPhones() {
    const response = await fetch(`${API_URL}/phones`);
    return handleResponse(response);
  },

  async addPhone(phoneData) {
    const response = await fetch(`${API_URL}/phones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phoneData)
    });
    return handleResponse(response);
  },

  async deletePhone(id) {
    const response = await fetch(`${API_URL}/phones/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};