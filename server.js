require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID   = process.env.CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ Не заданы BOT_TOKEN или CHAT_ID в .env');
    process.exit(1);
}

// ===== Настройка почты =====
const mailer = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 465),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
    }
});

// ===== Отправка в Telegram =====
async function sendToTelegram(text) {
    const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown'
        })
    }
    );
    const data = await response.json();
    if (!data.ok) throw new Error('Telegram: ' + data.description);
    return true;
}

// ===== Отправка на почту =====
async function sendToEmail(text, contact) {
    if (!process.env.MAIL_USER) {
    console.warn('⚠️ Почта не настроена — пропускаем');
    return false;
    }

    await mailer.sendMail({
    from: `"Шахматы" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO || process.env.MAIL_USER,
    replyTo: contact,
    subject: '🎓 Новая заявка на урок',
    text: text.replace(/\*/g, ''),  // убираем markdown-звёздочки для plain text
    html: text
        .replace(/\*(.+?)\*/g, '<b>$1</b>')
        .replace(/\n/g, '<br>')
    });
    return true;
}

// ===== Приём заявки =====
app.post('/api/join', async (req, res) => {
    const { name, contact, coach, level, time } = req.body;

    if (!name || !contact) {
    return res.status(400).json({ ok: false, error: 'Заполните имя и контакт' });
    }

    const text =
    `🎓 *Новая заявка на урок*\n\n` +
    `👤 Имя: ${escapeMd(name)}\n` +
    `📞 Контакт: ${escapeMd(contact)}\n` +
    `🏆 Тренер: ${escapeMd(coach || '—')}\n` +
    `📊 Уровень: ${escapeMd(level || '—')}\n` +
    `🕐 Время: ${escapeMd(time || '—')}`;

  // Отправляем оба параллельно, собираем результаты
    const results = await Promise.allSettled([
    sendToTelegram(text),
    sendToEmail(text, contact)
    ]);

    const tgOk   = results[0].status === 'fulfilled';
    const mailOk = results[1].status === 'fulfilled';

    if (!tgOk)   console.error('❌ Telegram:', results[0].reason?.message);
    if (!mailOk) console.error('❌ Email:',    results[1].reason?.message);

  // Успех, если хотя бы одно дошло
    if (tgOk || mailOk) {
    return res.json({ ok: true, telegram: tgOk, email: mailOk });
    }

    res.status(500).json({ ok: false, error: 'Не удалось отправить заявку' });
});

function escapeMd(str) {
    return String(str).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Сервер: http://localhost:${PORT}`);
});