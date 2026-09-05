const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const env = require('./env');

const { combine, timestamp, printf, colorize, errors, splat, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack ? `${ts} [${level}]: ${message}\n${stack}` : `${ts} [${level}]: ${message}`;
  })
);

const fileFormat = combine(timestamp(), errors({ stack: true }), splat(), json());

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: env.log.level,
  }),
];

if (!env.isTest) {
  transports.push(
    new DailyRotateFile({
      dirname: path.join(process.cwd(), env.log.dir),
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: fileFormat,
    }),
    new DailyRotateFile({
      dirname: path.join(process.cwd(), env.log.dir),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: fileFormat,
    })
  );
}

const logger = winston.createLogger({
  level: env.log.level,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
});

module.exports = logger;
