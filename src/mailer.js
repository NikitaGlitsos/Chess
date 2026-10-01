const nodemailer = require('nodemailer');

const MAIL_USER = process.env.MAIL_USER;

const mailer = MAIL_USER
  ? nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 465),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    })
  : null;

async function sendToEmail(text, contact) {
  if (!mailer) {
    console.warn('⚠️ Почта не настроена — пропускаем');
    return false;
  }

  await mailer.sendMail({
    from: `"Шахматы" <${MAIL_USER}>`,
    to: process.env.MAIL_TO || MAIL_USER,
    replyTo: contact,
    subject: '♞ Новая заявка на урок',
    text: text.replace(/\*/g, ''),
    html: text
      .replace(/\*(.+?)\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>')
  });

  return true;
}

module.exports = { sendToEmail };