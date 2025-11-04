// middlewares/errorMiddleware.js
export const errorMiddleware = (err, req, res, next) => {
  console.error("Error Middleware:", err.stack);

  // Default error
  let error = {
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  };

  // Mongoose validation error (if you use MongoDB later)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.status = 400;
    error.message = messages.join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.status = 400;
    error.message = 'Duplicate field value entered';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};