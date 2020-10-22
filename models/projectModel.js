const mongoose = require('mongoose');
const slugify = require('slugify');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A project must have a title!'],
      unique: true,
      trim: true,
      maxlength: [
        22,
        'A project title must have less than or equal to 22 chars!',
      ],
    },
    img: {
      type: String,
      required: [true, 'A project must have an image!'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A project must have a description!'],
    },
    projectDetail: {
      title: {
        type: String,
        required: [true, 'A project detail must have a title!'],
        unique: true,
        trim: true,
        maxlength: [
          22,
          'A project title must have less than or equal to 22 chars!',
        ],
      },
      subTitle: {
        type: String,
        required: [true, 'A project detail must have a title!'],
        trim: true,
      },
      details: {
        type: [String],
        default: [],
      },
    },
    gitRepoLinks: {
      type: [String],
      default: [],
    },
    demoLink: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    slug: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // createdAt only exists in the database and not selected to appear to the API response
    },
  },
  {
    toJSON: { virtuals: true }, // this is to enable adding virtual fields to the response
    toObject: { virtuals: true },
  }
);

/* Index middlewares */
/* End of index middlewares */

/* Virtual Middlewares */
/* End of virtual middlewares */

/* Document Middlewares - this keyword points to the current processed document */
projectSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});
/* End of document middlewares */

/* Query Middlewares - this keyword points to the current query */
/* End of query middlewares */

/* Aggregation Middlewares - this keyword points to the current aggregation object */
/* End of aggregation middlewares */

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;