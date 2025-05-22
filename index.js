const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Terima pesan dari Telegram
app.post('/telegram-webhook', async (req, res) => {
  const chatId = req.body.message.chat.id;
  const text = req.body.message.text;

  // Kirim ke Dialogflow
  const response = await kirimKeDialogflow(text, chatId.toString());

  // Balas ke Telegram
  await kirimBalasanTelegram(chatId, response);
  
  res.sendStatus(200);
});

// Terima dari Dialogflow (fulfillment)
app.post('/dialogflow-webhook', (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  let jawaban = '';

  if (intent === 'Sapaan') {
    jawaban = 'Halo! Senang bertemu denganmu 😊';
  } else {
    jawaban = req.body.queryResult.fulfillmentText || 'Maaf, saya tidak mengerti.';
  }

  res.json({ fulfillmentText: jawaban });
});

async function kirimKeDialogflow(pesan, sessionId) {
  const url = `https://dialogflow.cloud.google.com/#/editAgent/chatbotinfokampus-dqum/${sessionId}:detectIntent`;
  
  const result = await axios.post(url, {
    queryInput: { text: { text: pesan, languageCode: 'id' } }
  }, {
    headers: { 'Authorization': `Bearer ${await getTokenDialogflow()}` }
  });

  return result.data.queryResult.fulfillmentText;
}

async function kirimBalasanTelegram(chatId, pesan) {
  await axios.post(`https://api.telegram.org/8116153451:AAELMx8D4c88rtbrOdCCw86wFLSFH9QMxyU/sendMessage`, {
    chat_id: chatId,
    text: pesan
  });
}

// Fungsi untuk mendapatkan token Dialogflow (pakai Service Account)
async function getTokenDialogflow() {
  // Pakai Google Auth Library (lihat dokumentasi)
  return "token_dari_google_cloud";
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot jalan di port ${PORT}`));