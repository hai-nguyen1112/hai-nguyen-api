const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('../../models/projectModel');
const User = require('../../models/userModel');

// This is for nodeJS to run the config.env file. We must install dotenv first: npm install dotenv
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`Successfully connected to DB in ${process.env.NODE_ENV}`);
  });

// Read JSON files
const projects = JSON.parse(
  fs.readFileSync(`${__dirname}/projects.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// Import data into database
const importData = async () => {
  try {
    await User.create(users);
    await Project.create(projects);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data
const deleteData = async () => {
  try {
    await Project.deleteMany();
    await User.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
