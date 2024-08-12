const axios = require('axios');

async function getToken(url, email, password) {
    try {
        const response = await axios.post(`${url}/auth/login`, {
            email,
            password
        });

        const accessToken = response.data.data.access_token;
        return accessToken;
    } catch (error) {
        console.error('Ошибка запроса токена: ', error.response.data);
    }
}

module.exports = getToken