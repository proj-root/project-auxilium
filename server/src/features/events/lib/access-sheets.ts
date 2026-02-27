import { googleConfig } from "@/config/google.config";
import { JWT } from "google-auth-library";
import { sheets } from "@googleapis/sheets";

export async function accessSheets({ spreadsheetId, range = 'A:Z' }: { spreadsheetId: string, range?: string }) {
  const auth = new JWT({
    email: googleConfig.serviceAccountEmail,
    key: googleConfig.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

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