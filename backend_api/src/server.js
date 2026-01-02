try {
  // Prefer compiled TypeScript build output when present.
  // This preserves existing node-based start behavior if someone still invokes src/server.js.
  // eslint-disable-next-line global-require
  module.exports = require('../dist/server').default ?? require('../dist/server');
} catch (e) {
  // Fallback to previous JS server (legacy). This should only be used before the first build.
  // eslint-disable-next-line no-console
  console.warn('dist/server not found. Build the project (npm run build) to use TypeScript server.');
  // eslint-disable-next-line global-require
  const app = require('./app');

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  const server = app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at http://${HOST}:${PORT}`);
  });

  process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  module.exports = server;
}
