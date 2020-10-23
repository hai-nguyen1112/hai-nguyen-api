const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const filterObject = require('../utils/filterObject');
const AppError = require('../utils/AppError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // this makes the cookie not be modified by the browser
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true; // this makes the cookie sent with encryption https
  }

  // if (req.secure || req.headers('x-forwarded-proto') === 'https')
  //   cookieOptions.secure = true; // this is for heroku only

  // send the cookie back to client
  res.cookie('jwt', token, cookieOptions);

  // remove password from the response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // We need to use filteredBody to make sure a new user is created with allowed fields only, and the user cannot manually insert any malicous fields into our User database.
  const filteredBody = filterObject(
    req.body,
    'name',
    'email',
    'password',
    'passwordConfirm'
  );

  const newUser = await User.create(filteredBody);

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password included in the req.body
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if the user exists
  const user = await User.findOne({ email })
    .select('+password')
    .populate({ path: 'projects' });

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) If everything is ok, send token to the client
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('You are not logged in!', 401));

  // 2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  if (!decoded) return next(new AppError('Your token has expired!', 401));

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('The user of this token no longer exists!', 401));
  }

  // 4) Check if user changed password after the token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError('User recently changed password!. Please log in again', 401)
  //   );
  // }

  // 5) Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }
    return next();
  };
};
