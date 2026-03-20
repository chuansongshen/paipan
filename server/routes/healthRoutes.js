export function getHealthHandler() {
  return (_request, response) => {
    response.status(200).json({ status: 'ok' });
  };
}

export function registerHealthRoutes(app) {
  app.get('/api/health', getHealthHandler());
}
