const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const env = require('./config/env');
const requestLogger = require('./middlewares/requestLogger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { apiRateLimiter } = require('./middlewares/rateLimiter');
const { getDatabaseHealth } = require('./database/connection');
const ApiResponse = require('./utils/ApiResponse');
const apiRoutes = require('./routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.cors.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(mongoSanitize());
app.use(hpp());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

app.use(requestLogger);

app.use(env.apiPrefix, apiRateLimiter);

app.get('/health', (req, res) => {
  const dbHealth = getDatabaseHealth();

  return ApiResponse.ok(
    res,
    {
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.nodeEnv,
      database: dbHealth,
      timestamp: new Date().toISOString(),
    },
    'Service is healthy'
  );
});

app.get('/', (req, res) => {
  return ApiResponse.ok(
    res,
    { name: env.appName, version: '1.0.0' },
    'Smart Academic Scheduler API is running'
  );
});

app.use(env.apiPrefix, apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
