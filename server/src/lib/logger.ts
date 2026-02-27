import { SystemConfig } from "@/config/system.config";
import winston from "winston";
const { combine, timestamp, json, errors } = winston.format;

const consoleFormat = combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

export const logger = winston.createLogger({
  level: SystemConfig.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json(),
  ),
  transports: [
    new winston.transports.Console({
      format: combine(timestamp(), consoleFormat),
    }),

    // No need to log to files for now.
    ...(SystemConfig.nodeEnv === 'production'
      ? [
          new winston.transports.File({
            filename: '/tmp/logs/app.log',
            level: 'http',
          }),
          new winston.transports.File({
            filename: '/tmp/logs/errors.log',
            level: 'error',
          }),
        ]
      : [
          new winston.transports.File({
            filename: 'logs/app.log',
            level: 'http',
          }),
          new winston.transports.File({
            filename: 'logs/errors.log',
            level: 'error',
          }),
        ]),
  ],
  levels: {
    ...winston.config.syslog.levels,
    http: 7,
  },
});