const express = require('express');
const path = require('path');

const globalErrorHandler = require('./controllers/errorController');
const projectRouter = require('./routes/projectRoutes');
const AppError = require('./utils/AppError');

const app = express();

// 1) Define global middlewares

// This is a middleware that allows the app to serve static files stored in public folder
app.use(express.static(path.join(__dirname, 'public')));

// This is a middleware that adds the data in the body of the API request to the req argument passed in the route handler
app.use(express.json({ limit: '10kb' })); // If the body of the request is larger than 10kb, Express will not accept it.

// 2) Apply the routers

// Project router
app.use('/api/v1/projects', projectRouter);

// 3) Global error handling middlewares

// This is to send back an error whenever there is a request made to an undefined route. We must put this middleware after defined routes.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  // Express will skip all middlewares in the middle and go straight to the global error handling middleware below
});

// This is the middleware that runs the globalErrorHandler. We must place this middleware at the bottom of the app.js file. Whenever a next function receives an error as an argument and gets called, this middleware will get called.
app.use(globalErrorHandler);

module.exports = app;
