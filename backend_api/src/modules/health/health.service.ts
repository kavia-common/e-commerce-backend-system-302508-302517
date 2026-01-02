// PUBLIC_INTERFACE
export function getStatus() {
  /** Returns a basic health payload. */
  return {
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
}
