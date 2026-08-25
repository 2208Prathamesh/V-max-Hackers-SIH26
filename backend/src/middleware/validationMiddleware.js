const validationMiddleware = (validator) => {
  return async (req, res, next) => {
    try {
      const result = await validator(req);

      if (!result || result.valid === true) {
        return next();
      }

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.errors || [],
      });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validationMiddleware;