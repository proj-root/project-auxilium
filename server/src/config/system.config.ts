export const SystemConfig = {
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  tempSheetId: process.env.TEMP_SHEET_ID || '',
};

export const EventRolesConfig = {
  PARTICIPANT: 1,
  COORDINATOR: 2,
  MENTOR: 3,
  FACILITATOR: 4,
  POSTER_MAKER: 5,
  EMAIL_WRITER: 6,
  FORM_MAKER: 7,
}