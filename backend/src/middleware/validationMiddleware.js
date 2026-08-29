/**
 * Joi Validation Middleware
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {'body' | 'query' | 'params'} source - Request property to validate (default: 'body')
 */
const validationMiddleware = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      if (!schema || typeof schema.validate !== 'function') {
        return next()
      }

      const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true
      })

      if (error) {
        const errorMessages = error.details.map(detail => detail.message)
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        })
      }

      // Assign the sanitized/cast value back to request object
      req[source] = value
      return next()
    } catch (err) {
      return next(err)
    }
  }
}

export default validationMiddleware
