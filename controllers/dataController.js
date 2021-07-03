const catchAsync = require('./../utils/catchAsync');
const Data = require('./../models/dataModel');
const Relay = require('./../models/RelayModel');
const Device = require('./../models/deviceModel');
const AppError = require('../utils/appError');
exports.createData = catchAsync(async (req, res, next) => {
  post = await Data.create({ ...req.body, createdAt: new Date() });
  doc = await Relay.find()
    .sort({ _id: -1 })
    .limit(1);
  console.log(doc);
  res.status(201).json({
    status: 'success',
    data: {
      doc
    }
  });
});
exports.getDeviceData = catchAsync(async (req, res, next) => {
  // console.log("from controller",)
  const deviceID = req.query.device_id;
  const userId = req.user._id;
  console.log('the id is', userId);
  const device = await Device.findOne({ owner: userId });
  if (!device) {
    return next(
      new AppError('You cant access data of a device you dont own', 403)
    );
  }

  const deviceData = await Data.findOne({ device_imei: deviceID })
    .sort({ _id: -1 })
    .limit(1);
  res.status(200).json({
    status: 'sucess',
    data: deviceData
  });
});
