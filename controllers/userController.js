const User = require('../models/userModel');
const factory = require('./handlerFactory');

exports.createUser = factory.createOne(User);
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, { path: 'projects' });
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
