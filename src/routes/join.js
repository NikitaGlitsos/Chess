const express = require('express');
const { sendToTelegram } = require('../telegram');
const { sendToEmail } = require('../mailer');

const router = express.Router();

function escapeMd(str) {
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function detectContactType(contact) {
  if (contact.includes('@')) return 'email';
  return 'phone';
}

router.post('/join', async (req, res) => {
  const { name, contact, coach } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ ok: false, error: 'Заполните имя и контакт' });
  }

  const cleanName = name.trim();
  const cleanContact = contact.trim();
  const cleanCoach = (coach || '—').trim();

  if (cleanName.length < 2) {
    return res.status(400).json({ ok: false, error: 'Имя должно быть не короче 2 символов' });
  }

  if (cleanName.length > 60) {
    return res.status(400).json({ ok: false, error: 'Имя слишком длинное' });
  }

  const type = detectContactType(cleanContact);

  if (type === 'email') {
    if (!isValidEmail(cleanContact)) {
      return res.status(400).json({ ok: false, error: 'Введите правильный email' });
    }
  } else {
    if (!isValidPhone(cleanContact)) {
      return res.status(400).json({ ok: false, error: 'Введите правильный номер телефона' });
    }
  }

  const text =
    `🎓 *Новая заявка на урок*\n\n` +
    `👤 Имя: ${escapeMd(cleanName)}\n` +
    `📞 Контакт: ${escapeMd(cleanContact)}\n` +
    `🏆 Тренер: ${escapeMd(cleanCoach)}`;

  const results = await Promise.allSettled([
    sendToTelegram(text),
    sendToEmail(text, cleanContact)
  ]);

  const tgOk   = results[0].status === 'fulfilled';
  const mailOk = results[1].status === 'fulfilled';

  if (!tgOk)   console.error('❌ Telegram:', results[0].reason?.message);
  if (!mailOk) console.error('❌ Email:',    results[1].reason?.message);

  if (tgOk || mailOk) {
    return res.json({ ok: true, telegram: tgOk, email: mailOk });
  }

  res.status(500).json({ ok: false, error: 'Не удалось отправить заявку' });
});

module.exports = router;