const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIQueryFeatures = require('../utils/APIQueryFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError('There is no document found with that ID.', 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // This is to return the updated doc
      runValidators: true, // This is to run the validators that we set in the schema
    });

    if (!doc) {
      return next(
        new AppError('There is no document found with that ID.', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new AppError('There is no document found with that ID.', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: newDoc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const queryFeatures = new APIQueryFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await queryFeatures.query;

    res.status(200).json({
      status: 'success',
      totalResults: docs.length,
      data: docs,
    });
  });
