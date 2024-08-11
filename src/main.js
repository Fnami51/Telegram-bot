const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config')

const {token, directusUrl, directusToken} = config