const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const app = require('./app');
const socketIO = require('socket.io');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const GET_DEVICE_PARAMS_EVENT = 'GET_DEVICE_PARAMATERS';

// const DB = process.env.DATABASE_LOCAL;

const DB = process.env.DATABASE;

console.log('db is', DB);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
// exports.io = socketIO(server);

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
const io = socketIO(server, { cors: {} });
io.on('connection', socket => {
  console.log('client successfully', socket.id);
  exports.io = socket;
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
