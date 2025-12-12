// Global error handler middleware

const errorHandler = (error, req, res, next) => {
  console.error('Error occurred:', error);

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (error.message.includes('not found')) {
    statusCode = 404;
    message = error.message;
  } else if (error.message.includes('required') || 
             error.message.includes('Invalid') ||
             error.message.includes('already exists')) {
    statusCode = 400;
    message = error.message;
  } else if (error.message.includes('permission') || 
             error.message.includes('Insufficient')) {
    statusCode = 403;
    message = error.message;
  } else if (error.message.includes('Unauthorized')) {
    statusCode = 401;
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = errorHandler;
