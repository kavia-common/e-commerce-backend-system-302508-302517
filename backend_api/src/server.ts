import dotenv from 'dotenv';
dotenv.config();

import app from './app';

/**
 * PUBLIC_INTERFACE
 * Entrypoint for the Express server.
 * - Starts HTTP server on HOST:PORT
 * - Preserves GET / and /docs behavior
 */
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default server;
