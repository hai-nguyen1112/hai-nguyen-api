const User = require('../models/userModel');
const factory = require('./handlerFactory');

exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is no longer used to create a new user. Please sign up instead!',
  });
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(
  User,
  { path: 'projects' },
  { path: 'skills', select: '-users' }
);
exports.updateUser = factory.updateOne(User, 'role');
exports.deleteUser = factory.deleteOne(User);
