const successResponse = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200
) => {
  // Support legacy calls shaped as (res, statusCode, message, data).
  const isLegacyCall = typeof data === 'number'
  const responseData = isLegacyCall
    ? statusCode === 200
      ? null
      : statusCode
    : data
  const responseStatus = isLegacyCall ? data : statusCode

  return res.status(responseStatus).json({
    success: true,

    message,

    data: responseData
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
