const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const { appendToSheet } = require('./google');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/webhook', async (req, res) => {
  const message = req.body.Body || '';
  const from = req.body.From || '';
  console.log(`📩 Mensaje recibido de ${from}:`, message);

  try {
  const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que extrae el monto numérico desde mensajes tipo "Gasté $8.990 en sushi". Devuelve SOLO el número, sin puntos ni texto adicional.'
        },
        { role: 'user', content: message }
      ]
    });

    const montoExtraido = completion.data.choices[0].message.content.trim();
    console.log(`💵 Monto extraído:`, montoExtraido);

    await appendToSheet({
      fecha: new Date().toLocaleString('es-CL'),
      tipo: 'Gasto',
      monto: montoExtraido,
      descripcion: message
    });

    res.send('<Response><Message>Monto registrado: ' + montoExtraido + '</Message></Response>');
  } catch (error) {
    console.error('❌ Error completo:', error); // 👈 esto es nuevo
    res.send('<Response><Message>Ocurrió un error procesando tu mensaje.</Message></Response>');
  }


});

app.get('/', (req, res) => res.send('Bot activo ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));
