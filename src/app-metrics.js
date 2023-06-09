// Load config and metrics client
var config = require('./config');
var register = require('./metrics').client.register

// Load express
var createError = require('http-errors');
var express = require('express');
var app = express();

// Setup metrics route
app.get('/metrics', async function(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     res.render('error', { title: 'Express' });
// });

module.exports = app;
