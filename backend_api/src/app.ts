import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load env early (keeps existing behavior with .env)
dotenv.config();

// Initialize express app
const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allowedHeaders = (process.env.ALLOWED_HEADERS ?? 'Content-Type,Authorization')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allowedMethods = (process.env.ALLOWED_METHODS ?? 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: allowedMethods,
    allowedHeaders
  })
);

if ((process.env.TRUST_PROXY ?? 'true').toLowerCase() === 'true') {
  app.set('trust proxy', true);
}

app.use(helmet());
app.use(morgan('combined'));

const windowS = Number(process.env.RATE_LIMIT_WINDOW_S ?? '60');
const max = Number(process.env.RATE_LIMIT_MAX ?? '100');

app.use(
  rateLimit({
    windowMs: (Number.isFinite(windowS) ? windowS : 60) * 1000,
    limit: Number.isFinite(max) ? max : 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

// Parse JSON request body
app.use(express.json({ limit: '1mb' }));

// Swagger: preserve existing /docs behavior with dynamic servers injection.
const swaggerSpec = require('../swagger');
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol;

  const actualPort = req.socket.localPort;
  const hasPort = host?.includes(':') ?? false;

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) || (protocol === 'https' && actualPort !== 443));

  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [{ url: `${protocol}://${fullHost}` }],
    components: {
      ...(swaggerSpec.components ?? {}),
      securitySchemes: {
        ...(swaggerSpec.components?.securitySchemes ?? {}),
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  };

  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Mount routes (keep GET / unprotected)
app.use('/', routes);

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
