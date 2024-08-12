const axios = require('axios');

async function saveReaction(url, token, messageId, userId, reaction) {
    try {
      await axios.post(
        `${url}/items/nazar_reactions`,
        { message_id: messageId, user_id: userId, reaction },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Ошибка сохранения реакции в Directus', error);
    }
  }
  

  async function getStatistics(url, token, messageId) {
    try {
      const response = await axios.get(
        `${url}/items/nazar_reactions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const reactions = response.data.data.filter((item) => item.message_id === messageId);

      const likes = reactions.filter(r => r.reaction === 'like').length;
      const dislikes = reactions.filter(r => r.reaction === 'dislike').length;
      return { likes, dislikes };
    } catch (error) {
      console.error('Ошибка получения статистики из Directus', error);
      return { likes: 0, dislikes: 0 };
    }
  }

  module.exports = {saveReaction, getStatistics}