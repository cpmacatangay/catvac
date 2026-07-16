export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { message: `Route ${req.method} ${req.url} not found`, code: 'NOT_FOUND' },
  })
}
