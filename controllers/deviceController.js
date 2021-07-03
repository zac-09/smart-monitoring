const catchAsync = require('../utils/catchAsync');
const Device = require('./../models/deviceModel');

exports.registerDevice = catchAsync(async (req, res, next) => {
  device = await Device.create(req.body);

  res.status(201).json({
    status: "success",
    data: device
  });
});
