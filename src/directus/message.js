const axios = require('axios');

async function saveMessage(url, token, text) {
  try {
    const response = await axios.post(
      `${url}/items/nazar_messages`,
      { text },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.data.id;
  } catch (error) {
    console.error('Ошибка сохранения сообщения в Directus: ', error);
  }
}

module.exports = saveMessage