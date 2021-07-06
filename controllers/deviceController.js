const catchAsync = require('../utils/catchAsync');
const Device = require('./../models/deviceModel');

exports.registerDevice = catchAsync(async (req, res, next) => {
  const user = req.user;

  device = await Device.create({ ...req.body, owner: user._id });
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
