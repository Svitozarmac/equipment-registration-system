/**
 * App setup file
 */

const express = require("express");
const createError = require("http-errors");
const path = require("path");
const logger = require('morgan');
const mongoose = require("mongoose"); // Import the mongoose module
const methodOverride = require('method-override'); // Import method override package
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index');
const equipmentRouter = require('./routes/equipment');

const app = express(); // create an instance of express module

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // This loads views/layout.ejs by default

// Middleware setup
app.use(logger('dev')); // Concise output colored by response status for development use
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // This is a built-in middleware function in Express that serves static files from the specified directory.
app.use(express.urlencoded({ extended: false }));  // This is a built-in Express middleware that parses incoming request bodies from HTML forms and makes the data available in req.body
app.use(methodOverride('_method')); // Enables using _method in form submissions for PUT and DELETE

// Database connection
const URL = "mongodb+srv://zarikmen111:PgJBJIJXhgQ8rTM5@clustersvit.kutkmui.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSvit";
const connect = mongoose.connect(URL);
connect.then((db) => {
  console.log("MongoDB correctly connected to server");
}, (err) => {
  console.log(err);
}
);

// Assigning routes
app.use('/', indexRouter); // This line mounts the corresponding router at a specific path
app.use('/equipment', equipmentRouter);  // This line tells Express to use the equipmentRouter for any requests that start with /equipment

// Error Handling
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error Occured'
  }); // pass to error page
});

// Start the server
app.listen(4000, 'localhost', () => {
  console.log('Server is running on port 4000');
});

module.exports = app;
