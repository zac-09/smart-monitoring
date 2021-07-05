const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');

const dataRouter = require('./routes/dataRouter');
const switchRouter = require('./routes/switchRouter');
const deviceRouter = require('./routes/deviceRouter');

const app = express();
const cors = require('cors');

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers

app.use(helmet());
app.use(
  cors({
    credentials: true
  })
);
app.all('*',cors())
app.options('*', cors());

// Development logging
// if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
// }

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// 3) ROUTES

app.use('/api/v1/users', userRouter);
app.use('/api/v1/data', dataRouter);
app.use('/api/v1/switch', switchRouter);
app.use('/api/v1/devices', deviceRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
