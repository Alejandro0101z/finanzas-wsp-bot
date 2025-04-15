const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const { appendToSheet } = require('./google');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/', async (req, res) => {
  const message = req.body.Body || '';
  const from = req.body.From || '';
  console.log(`📩 Mensaje recibido de ${from}:`, message);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que extrae el monto numérico desde mensajes tipo "Gasté $8.990 en sushi". Devuelve sólo el número con punto, sin símbolo ni texto.'
        },
        { role: 'user', content: message }
      ]
    });

    // Validar la respuesta
    if (
      !completion ||
      !completion.choices ||
      !completion.choices[0] ||
      !completion.choices[0].message
    ) {
      console.error("❌ Error: No se pudo obtener la respuesta de OpenAI.");
      return res.sendStatus(500);
    }

    const montoExtraido = completion.choices[0].message.content.trim();
    console.log('🧾 Monto extraído:', montoExtraido);

    // Guardar en la hoja
    await appendToSheet({
      fecha: new Date().toLocaleString('es-CL'),
      tipo: 'Gasto',
      monto: montoExtraido,
      descripcion: message
    });

    res.send('✅ Monto registrado: ' + montoExtraido);
  } catch (error) {
    console.error('❌ Error completo:', error);
    res.sendStatus(500);
  }
});

app.listen(10000, () => {
  console.log('🚀 Servidor activo en puerto 10000');
});
