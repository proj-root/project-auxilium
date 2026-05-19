export const SystemConfig = {
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  tempSheetId: process.env.TEMP_SHEET_ID || '',
};
