// google.js
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const auth = new GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

const appendToSheet = async ({ fecha, tipo, monto, descripcion }) => {
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: '12OjTJuX7vA4tWzePoYFrlAmE_7CwzhgtVeTHBhlocVo',
    range: 'Hoja 1!A:D',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[fecha, tipo, monto, descripcion]]
    }
  });
  console.log('✅ Datos guardados en Google Sheets:', response.data.updates.updatedRange);
};

module.exports = { appendToSheet };
