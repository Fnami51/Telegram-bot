require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const {loadUsers, saveUser} = require('./directus/users');
const {saveMessage, getMessages} = require('./directus/message');
const { getStatistics, saveReaction } = require('./directus/reactions');
const getToken = require('./directus/token');

const port = process.env.PORT || 3000;
const token = process.env.TELEGRAM_BOT_TOKEN;
const directusUrl = process.env.DIRECTUS_URL;
const email = process.env.DIRECTUS_EMAIL;
const password = process.env.DIRECTUS_PASSWORD;

if (!process.env) {
  throw new Error('Не найден конфигурирующий файл .env');
}

const bot = new TelegramBot(token, { polling: true });

let users = [];

const app = express();
app.listen(port, () => {
  console.info(`Сервер запущен => port:${port}`);
});

const startApp = (function () {
  let cachedDirectusToken = null;
  let isFirstStart = false;

  return async function () {
    if (isFirstStart) {
      return cachedDirectusToken;
    }

    cachedDirectusToken = await getToken(directusUrl, email, password);
    const usersFromDirectus = await loadUsers(directusUrl, cachedDirectusToken);
    users = usersFromDirectus.map(user => user.chat_id);

    isFirstStart = true;
    return cachedDirectusToken;
  };
})();

startApp().then(() => {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username;

    const directusToken = await startApp(); 

    if (!users.includes(chatId)) {
      users.push(chatId);
      await saveUser(directusUrl, directusToken, chatId, username);
    }

    bot.sendMessage(chatId, 'Бот добавлен');
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const numberMessage = msg.message_id;

    if (!text.startsWith('/')) {
      const directusToken = await startApp(); 
      const messageId = await saveMessage(directusUrl, directusToken, text, chatId, numberMessage);

      users.forEach(async (userId) => {
        if (userId !== chatId) {
          await bot.sendMessage(userId, text, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '👍', callback_data: `like_${messageId}` },
                  { text: '👎', callback_data: `dislike_${messageId}` },
                ]
              ]
            }
          });
        }
      });
    }
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    const directusToken = await startApp(); 

    if (data.startsWith('like_') || data.startsWith('dislike_')) {
      const [action, messageId] = data.split('_');
      await saveReaction(directusUrl, directusToken, messageId, chatId, action === 'like' ? 'like' : 'dislike');
      bot.answerCallbackQuery(query.id, { text: `Вы поставили ${action === 'like' ? 'лайк' : 'дизлайк'}` });
    }
  });

  bot.onText(/\/stat/i, async (msg) => {
    if (msg.reply_to_message) {
      const chatId = msg.chat.id;
      const replyId = msg.reply_to_message.message_id; 

      const directusToken = await startApp(); 

      const messages = await getMessages(directusUrl, directusToken);
      console.log(messages);
      const message = messages.find(message => Number(message.number) === replyId && Number(message.chat_ID) === chatId);

      if (message) {
        const statistic = await getStatistics(directusUrl, directusToken, message.id);
            
        bot.sendMessage(chatId, 
          `Статистика сообщения:\n👍 Лайков: ${statistic.likes}\n👎 Дизлайков: ${statistic.dislikes}`,
          { reply_to_message_id: replyId } 
        );
      } else {
        bot.sendMessage(chatId, "Сообщение не найдено в базе данных.");
      }
    } else {
      bot.sendMessage(msg.chat.id, "Пожалуйста, используйте команду '/stat' в ответе на сообщение.");
    }
  });
});
