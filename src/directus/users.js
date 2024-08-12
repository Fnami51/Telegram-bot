const axios = require('axios');

async function loadUsers(url, token) {
  try {
    const response = await axios.get(
      `${url}/items/nazar_users`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Ошибка загрузки пользователей из Directus', error);
  }
}

async function saveUser(url, token, chatId, username) {
  try {
    await axios.post(
      `${url}/items/nazar_users`,
      { chat_id: chatId, username },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  } catch (error) {
    console.error('Ошибка сохранения пользователя в Directus', error);
  }
}

module.exports = {loadUsers, saveUser};