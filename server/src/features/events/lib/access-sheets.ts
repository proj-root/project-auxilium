import { googleConfig } from '@/config/google.config';
import { JWT } from 'google-auth-library';
import { sheets } from '@googleapis/sheets';
import { logger } from '@/lib/logger';

const auth = new JWT({
  email: googleConfig.serviceAccountEmail,
  key: googleConfig.privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function accessSheets({
  spreadsheetId,
  range = 'A:Z',
}: {
  spreadsheetId: string;
  range?: string;
}) {
  const GoogleSheets = sheets({ version: 'v4', auth });
  const response = await GoogleSheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return [];
  }
  return rows;
}

export async function insertIntoSheet({
  spreadsheetId,
  range = 'A:Z',
  values,
}: {
  spreadsheetId: string;
  range?: string;
  values: any[][];
}) {
  const GoogleSheets = sheets({ version: 'v4', auth });
  const response = await GoogleSheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });

  logger.debug(`Inserted ${values.length} rows into sheet ${spreadsheetId}.`);
  return response;
}
