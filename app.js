var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var userRouter = require('./routes/user');
const db = require('./config/connection')
var session = require('express-session')
var app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Fixed typo from 'Contend-Type' to 'Content-Type'
  credentials: true // Allow credentials (cookies/sessions)
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'ajajajajajaja', // replace with a strong secret
  resave: false, 
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));


app.use('/', userRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



db.connect((err) => {
  if (err) {
    console.log('Database Not connected ', err);
  } else {
    console.log('DataBase Connected ');

  }
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
