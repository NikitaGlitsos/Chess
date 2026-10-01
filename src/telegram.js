const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID   = process.env.CHAT_ID;

let tgAgent;
if (process.env.TG_PROXY) {
  try {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    tgAgent = new HttpsProxyAgent(process.env.TG_PROXY);
  } catch {
    console.warn('⚠️ https-proxy-agent не установлен — прокси пропущен');
  }
}

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
      }),
      ...(tgAgent && { agent: tgAgent })
    }
  );

  const data = await response.json();
  if (!data.ok) throw new Error('Telegram: ' + data.description);
  return true;
}

module.exports = { sendToTelegram };