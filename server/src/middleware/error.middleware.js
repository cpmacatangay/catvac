export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500
  const code = err.code || 'INTERNAL_ERROR'

  req.log.error({ err, status, reqId: req.id }, 'request error')

  res.status(status).json({
    error: {
      message: err.message || 'Internal server error',
      code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  })
}
