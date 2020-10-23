const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      required: [true, 'Skill title is required!'],
      maxlength: [20, 'Skill title cannot be longer than 29 chars!'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Skill description is required!'],
      trim: true,
    },
    img: {
      type: String,
      required: [true, 'Skill image is required!'],
    },
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // this is to add the virtual fields to the response
    toObject: { virtuals: true },
  }
);

/* Index middlewares */
/* End of index middlewares */

/* Virtual Middlewares */
/* End of virtual middlewares */

/* Document Middlewares - this keyword points to the current processed document */
/* End of document middlewares */

/* Query Middlewares - this keyword points to the current query */
/* End of query middlewares */

/* Aggregation Middlewares - this keyword points to the current aggregation object */
/* End of aggregation middlewares */

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
