const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 404);
};

const handleDuplicateFieldsDB = (err) => {
  if (Object.keys(err.keyValue)[0] === 'email') {
    return new AppError(
      'This email aleady exists in the database. If you forgot your password, please reset password!',
      400
    );
  }
  return new AppError(
    `Duplicate field value: [${Object.keys(err.keyValue)[0]}: ${
      Object.values(err.keyValue)[0]
    }]`,
    400
  );
};

const handleValidationErrorDB = (err) => {
  const errorMessages = Object.values(err.errors).map((err) => err.message);
  return new AppError(`Invalid input data. ${errorMessages.join(' ')}`, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again!', 401);
};

const sendErrorDev = (err, req, res) => {
  // Check to make sure the error is API error
  // We only handle API errors because this app is pure API app
  // Because this is the development env, we send the entire error to debug
  // originalUrl is the url without the host name
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming or unknown error: send generic message without error details to client
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong! Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Handle invalid database IDs
    if (err.stack.startsWith('CastError')) {
      error = handleCastErrorDB(err);
    }

    // Handle duplicate fields
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }

    // Handle mongoose validation errors
    if (err._message && err._message.includes('validation')) {
      error = handleValidationErrorDB(err);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};
