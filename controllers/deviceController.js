const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Device = require('./../models/deviceModel');
const Relay = require('./../models/RelayModel');
exports.registerDevice = catchAsync(async (req, res, next) => {
  const user = req.user;

  const device = await Device.create({ ...req.body, owner: user._id });
  const relay = await Relay.create({
    device_imei: device.device_imei,
    relay: 0,
    createdAt: new Date()
  });
  const devices = await Device.find({
    owner: user._id,
    status: { $ne: 'deleted' }
  });
  res.status(201).json({
    status: 'success',
    data: devices
  });
});
exports.getAllUserDevices = catchAsync(async (req, res, next) => {
  const user = req.user;

  const devices = await Device.find({
    owner: user._id,
    status: { $ne: 'deleted' }
  });
  res.status(200).json({
    status: 'success',
    devices
  });
});

exports.deleteDevice = catchAsync(async (req, res, next) => {
  // console.log("from controller",)
  const deviceID = req.query.device_id;
  const userId = req.user._id;
  // console.log('the id is', userId);
  const device = await Device.findOne({ owner: userId, device_imei: deviceID });
  if (!device) {
    return next(
      new AppError('You cant delete data of a device you dont own', 403)
    );
  }
  device.status = 'deleted';
  await device.save();

  res.status(204).json({
    status: 'sucess'
  });
});

exports.updateDevice = catchAsync(async (req, res, next) => {
  console.log("the locations is",req.body.device_location)
  const device = await Device.findByIdAndUpdate(
    req.body.device_imei,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!device) {
    return next(new AppError("Couldn'r find device with that id", 404));
  }
  res.status(200).json({
    status: 'sucess',
    device
  });
});
