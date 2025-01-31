var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');
const ErrsoleSQLite = require('errsole-sqlite');
const mongoose = require('mongoose');
const os = require('os');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts')

require('dotenv').config();

var indexRouter = require('./routes/index');
var providersRouter = require('./routes/providers');
var servicemenRouter = require('./routes/servicemen');
var apiVersionOneRouter = require('./routes/apiVersionOne');

// Insert the Errsole code snippet at the beginning of your app's main file
if (process.env.NODE_ENV === 'production') {
  // Production Environment: Centralized logging with MongoDB
  errsole.initialize({
    storage: new ErrsoleMongoDB(process.env.MONGO_URL, 'fixit', { collectionPrefix: 'fixitcalls' }),
    appName: 'fixit',
    environmentName: process.env.NODE_ENV,
  });
} else {
  // Development/Other Environments: Local logging with SQLite
  const logsFile = path.join(os.tmpdir(), 'fixit.log.sqlite');
  errsole.initialize({
    storage: new ErrsoleSQLite(logsFile),
    appName: 'fixit',
    environmentName: process.env.NODE_ENV,
  });
}

var app = express();
mongoose.connect(process.env.MONGO_URL);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/provider', providersRouter);
app.use('/serviceman', servicemenRouter);
app.use('/api/v1', apiVersionOneRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
