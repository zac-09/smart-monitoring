const catchAsync = require('./../utils/catchAsync');
const Data = require('./../models/dataModel');
const Relay = require('./../models/RelayModel');
const Device = require('./../models/deviceModel');
const AppError = require('../utils/appError');
const socket = require('./../server');
const GET_DEVICE_PARAMS_EVENT = 'GET_DEVICE_PARAMATERS';

exports.createData = catchAsync(async (req, res, next) => {
  const device = await Device.findOne({ device_imei: req.body.device_imei });
  if (!device) {
    return next(new AppError('device imei is inccorect', 400));
  }
  device.logging_status = 'online';
  await device.save();
  const post = await Data.create({ ...req.body, createdAt: new Date() });
  if (socket.io.emit) {
    socket.io.emit(`${GET_DEVICE_PARAMS_EVENT}-${post.device_imei}`, post);
  }

  console.log(
    'emit data ',
    `${GET_DEVICE_PARAMS_EVENT}-${post.device_imei}`,
    post
  );
  doc = await Relay.find({ device_imei: post.device_imei })
    .sort({ _id: -1 })
    .limit(1);
  console.log(doc);
  res.status(201).json({
    status: 'success',
    relay: doc[0].relay
  });
});
exports.getDeviceData = catchAsync(async (req, res, next) => {
  // console.log("from controller",)
  const deviceID = req.query.device_id;
  const userId = req.user._id;
  // console.log('the id is', userId);
  const device = await Device.findOne({ owner: userId, device_imei: deviceID });
  if (!device) {
    return next(
      new AppError('You cant access data of a device you dont own', 403)
    );
  }

  if (device.status === 'deleted') {
    console.log('device is', device);
    return next(new AppError('the device has been deleted', 400));
  }
  const deviceData = await Data.findOne({ device_imei: deviceID })
    .sort({ _id: -1 })
    .limit(1);
  res.status(200).json({
    status: 'sucess',
    data: deviceData
  });
});
