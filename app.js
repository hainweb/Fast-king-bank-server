var createError = require('http-errors');
var express = require('express');
var path = require('path'); 
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const MongoStore = require('connect-mongo');
var cors = require('cors');
var session = require('express-session');
const compression = require('compression');

var userRouter = require('./routes/user');
const db = require('./config/connection');

var app = express();

// Use compression for performance
app.use(compression());

// CORS Configuration
app.use(cors({
  origin: 'https://fast-king-bank.onrender.com', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session Middleware with Performance Improvements
const sessionMiddleware = session({
  secret: 'ajinajinshoppingsecretisajin',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://ajinrajeshhillten:Zlkkf73UtUnnZBbU@bank.x6s92.mongodb.net/?retryWrites=true&w=majority&appName=bank',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day session
    autoRemove: 'interval',
    autoRemoveInterval: 10 // Remove expired sessions every 10 minutes
  }),
  cookie: {
    secure: false, // Changed from env-based check
    httpOnly: true,
    sameSite: 'lax', // Changed from env-based check
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
});

// Add this before your routes
app.set('trust proxy', 1);
app.use(sessionMiddleware);

// Routes
app.use('/', userRouter);

// 404 handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler with improved logging
app.use(function (err, req, res, next) {
  console.error(err); // Log the full error for server-side tracking
  
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // Send error response
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
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
