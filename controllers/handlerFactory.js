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

exports.updateOne = (Model, ...notAllowedFields) =>
  catchAsync(async (req, res, next) => {
    let filteredBody = JSON.parse(JSON.stringify(req.body));

    notAllowedFields.forEach((field) => delete filteredBody[field]);

    console.log(filteredBody);

    const updatableFields = Object.keys(Model.schema.paths).filter(
      (field) => field !== '_id' && field !== '__v'
    );
    console.log(updatableFields);
    for (const field in filteredBody) {
      if (!updatableFields.includes(field)) {
        delete filteredBody[field];
      }
    }

    console.log(filteredBody);

    if (Object.keys(filteredBody).length === 0) {
      return next(
        new AppError('You are trying to update non-existing fields!', 400)
      );
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
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

exports.getOne = (Model, ...popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    // if (popOptions) query = query.populate(popOptions);

    if (popOptions) {
      popOptions.forEach((popOption) => (query = query.populate(popOption)));
    }

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
