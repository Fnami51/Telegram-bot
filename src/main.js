const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config')

const {port, token, directusUrl, directusToken} = config

const bot = new TelegramBot(token, { polling: true });

let users = new Set();

const app = express();
app.get('/', (req, res) => {
    res.send('Бот работает');
  });
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
  });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    users.add(chatId);
    bot.sendMessage(chatId, 'Бот добавлен');
  });