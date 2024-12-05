var createError = require('http-errors');
var express = require('express');
var path = require('path'); 
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const MongoStore = require('connect-mongo');
var cors = require('cors') 
var session = require('express-session')
const compression = require('compression');

var userRouter = require('./routes/user');
const db = require('./config/connection')

var app = express();

// Compression middleware
app.use(compression());

// CORS Configuration
app.use(cors({
  origin: 'https://fast-king-bank.onrender.com', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration with Enhanced Options
const sessionMiddleware = session({
  secret: 'ajinajinshoppingsecretisajin',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://ajinrajeshhillten:Zlkkf73UtUnnZBbU@bank.x6s92.mongodb.net/?retryWrites=true&w=majority&appName=bank',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // Session TTL (1 day)
    autoRemove: 'interval',
    autoRemoveInterval: 10 // Remove expired sessions every 10 minutes
  }),
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax', // Or 'none' if cross-site
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
});

// Trust proxy for Render
app.set('trust proxy', 1);
app.use(sessionMiddleware);

// Routes
app.use('/', userRouter);

// 404 handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler with detailed logging
app.use(function (err, req, res, next) {
  // Log the error for server-side tracking
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500
  });

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // Send error response
  res.status(err.status || 500);
  res.render('error');
});

// Database connection
db.connect((err) => {
  if (err) {
    console.log('Database Not connected ', err);
  } else {
    console.log('DataBase Connected ');
  }
});

module.exports = app;
