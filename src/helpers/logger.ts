import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  transports: [
    new transports.Console({
      handleExceptions: true,
      level: 'verbose',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.splat(),
        format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
        format.printf((info) => (Object.keys(info.metadata).length
          ? `${info.timestamp} | [${info.level}] ${info.message} | ${JSON.stringify(info.metadata)}`
          : `${info.timestamp} | [${info.level}] ${info.message}`)),
      ),
    }),
  ],
  exitOnError: false,
});
