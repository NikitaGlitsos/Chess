function validateConfig() {
    const required = ['BOT_TOKEN', 'CHAT_ID'];

    for (const key of required) {
    if (!process.env[key]) {
        console.error(`❌ Не задано ${key} в .env`);
        process.exit(1);
    }
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn('⚠️ Почта не настроена — заявки пойдут только в Telegram');
    }

    console.log('✅ Конфигурация загружена');
}

module.exports = { validateConfig };