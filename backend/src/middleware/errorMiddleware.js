const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message)

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    })
  }

  // Duplicate MongoDB field
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]

    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired'
    })
  }

  // Custom application error
  const statusCode = err.statusCode || 500

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  })
}

export default errorMiddleware
