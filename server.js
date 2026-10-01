require('dotenv').config();

const express = require('express');
const path = require('path');

const { validateConfig } = require('./src/config');
const joinRouter = require('./src/routes/join');

validateConfig();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', joinRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер: http://localhost:${PORT}`);
});