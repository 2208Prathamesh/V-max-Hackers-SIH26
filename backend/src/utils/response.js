const successResponse = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

const errorResponse = (
  res,
  message = 'Something went wrong',
  statusCode = 500,
  errors = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  })
}

const createdResponse = (
  res,
  data = null,
  message = 'Created successfully'
) => {
  return successResponse(res, data, message, 201)
}

const noContentResponse = res => {
  return res.status(204).send()
}

export { successResponse, errorResponse, createdResponse, noContentResponse }
export default { successResponse, errorResponse, createdResponse, noContentResponse }
