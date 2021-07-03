const catchAsync = require('./../utils/catchAsync');
const Device = require('./../models/deviceModel');
const AppError = require('../utils/appError');
const Relay = require('./../models/RelayModel');
exports.updateStatus = catchAsync(async (req, res, next) => {
  const device_id = req.body.device_imei;
  const device = await Device.find({ device_imei: device_id });

  if (!device) {
    return next(new AppError('device not found', 404));
  }
  const relay = await Relay.create({ ...req.body, createdAt: new Date() });

  res.status(201).json({
    status: 'success',
    data: {
      relay
    }
  });
});
exports.getRelayState = catchAsync(async (req, res, next) => {
  const device_id = req.query.device_id;
  const device = await Device.find({ device_imei: device_id });
  if (!device) {
    return next(new AppError('device not found', 404));
  }
  const state = await Relay.find({ device_imei: device_id }).sort({_id:-1}).limit(1)
  if (!state) {
    return next(new AppError('switch state not found', 404));
  }
  res.status(200).json({
    status: 'success',
    relay: state[0]
  });
});
