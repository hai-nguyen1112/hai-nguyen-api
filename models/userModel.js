const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required!'],
      maxlength: [20, 'Name cannot be longer than 20 characters!'],
    },
    email: {
      type: String,
      required: [true, 'Email is required!'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Invalid email!'],
    },
    password: {
      type: String,
      required: [true, 'Password is required!'],
      minlength: [8, 'Password must be at least 8 characters!'],
      select: false, // This is to not return password to the client
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password!'],
      select: false,
      validate: {
        // This only works on CREATE and SAVE. It does not work on UPDATE
        validator: function (passwordConfirm) {
          // this keywork points to the current user
          return passwordConfirm === this.password;
        },
        message: 'Password confirmation does not match',
      },
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    intro: {
      type: String,
      default: 'Introduction will be input later.',
    },
    education: {
      type: [[String]],
      default: [['Education will be input later.']],
    },
    employmentHistory: {
      type: [[String]],
      default: [['Employment history will be input later.']],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true }, // this is to enable adding virtual fields to the response
    toObject: { virtuals: true },
  }
);

/* Index middlewares */
/* End of index middlewares */

/* Virtual Middlewares */
userSchema.virtual('projects', {
  ref: 'Project',
  foreignField: 'user',
  localField: '_id',
});
/* End of virtual middlewares */

/* Document Middlewares - this keyword points to the current processed document */
// This is a middleware that is used to hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  // If the password field is not modified, we do nothing
  if (!this.isModified('password')) return next();

  // Hash the password with the code of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Get rid of passwordConfirm because we don't need to store it in the database
  this.passwordConfirm = undefined;

  next();
});

// This is an instance method which is available for every document of a collection
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
/* End of document middlewares */

/* Query Middlewares - this keyword points to the current query */
/* End of query middlewares */

/* Aggregation Middlewares - this keyword points to the current aggregation object */
/* End of aggregation middlewares */

const User = mongoose.model('User', userSchema);

module.exports = User;
