const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');

// Allow NodeJS to run the config.env file
dotenv.config({ path: './config.env' });

// Connect the database hosted on the cluster on Mongo Atlas to our Express application
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`Successfully connected to DB in ${process.env.NODE_ENV}`);
  });

// Run the server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port} in ${process.env.NODE_ENV}`);
});
