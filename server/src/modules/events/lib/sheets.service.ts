import { Injectable, Logger } from '@nestjs/common';
import { googleConfig } from '@/config/google.config';
import { JWT } from 'google-auth-library';
import { sheets } from '@googleapis/sheets';
import { APIError } from '@auxilium/types/errors';

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name);
  private readonly auth: JWT;

  constructor() {
    this.auth = new JWT({
      email: googleConfig.serviceAccountEmail,
      key: googleConfig.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async getSheetData({
    spreadsheetId,
    range = 'A:Z',
  }: {
    spreadsheetId: string;
    range?: string;
  }): Promise<string[][]> {
    try {
      const GoogleSheets = sheets({ version: 'v4', auth: this.auth });
      const response = await GoogleSheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        this.logger.debug(`No data found in sheet: ${spreadsheetId}`);
        return [];
      }

      this.logger.debug(
        `Retrieved ${rows.length} rows from spreadsheet: ${spreadsheetId}`,
      );
      return rows;
    } catch (error) {
      this.logger.error(
        `Error accessing spreadsheet ${spreadsheetId}:`,
        error,
      );
      throw new APIError('Failed to access Google Sheets', 500);
    }
  }

  async insertIntoSheet({
    spreadsheetId,
    range = 'A:Z',
    values,
  }: {
    spreadsheetId: string;
    range?: string;
    values: string[][];
  }): Promise<void> {
    try {
      const GoogleSheets = sheets({ version: 'v4', auth: this.auth });
      await GoogleSheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      this.logger.debug(
        `Inserted ${values.length} rows into sheet ${spreadsheetId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error inserting data into spreadsheet ${spreadsheetId}:`,
        error,
      );
      throw new APIError('Failed to insert data into Google Sheets', 500);
    }
  }

  extractSpreadsheetId(url: string): string {
    try {
      const id = url.split('/')[5];
      if (!id) {
        throw new APIError('Invalid spreadsheet URL format', 400);
      }
      return id;
    } catch (error) {
      this.logger.error('Error extracting spreadsheet ID from URL:', error);
      throw new APIError('Invalid spreadsheet URL format', 400);
    }
  }
}
