const axios = require('axios');

async function saveMessage(url, token, text, chat_ID, number) {
  try {
    const response = await axios.post(
      `${url}/items/nazar_messages`,
      { text, 
        chat_ID, 
        number},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.data.id;
  } catch (error) {
    console.error('Ошибка сохранения сообщения в Directus: ', error);
  }
}

async function getMessages(url, token) {
  try {
    const response = await axios.get(
      `${url}/items/nazar_messages`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Ошибка получения сообщений в Directus: ', error);
  }
}

module.exports = {saveMessage, getMessages};