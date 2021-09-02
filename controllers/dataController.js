const catchAsync = require('./../utils/catchAsync');
const Data = require('./../models/dataModel');
const Relay = require('./../models/RelayModel');
const Device = require('./../models/deviceModel');
const AppError = require('../utils/appError');
const socket = require('./../server');
const moment = require('moment');

const GET_DEVICE_PARAMS_EVENT = 'GET_DEVICE_PARAMATERS';
process.env.TZ = 'Africa/Nairobi';
exports.createData = catchAsync(async (req, res, next) => {
  const device = await Device.findOne({ device_imei: req.body.device_serial });
  if (!device) {
    return next(new AppError('device imei is inccorect', 400));
  }
  device.logging_status = 'online';
  await device.save();
  const post = await Data.create({
    ...req.body,
    createdAt: new Date(),
    device_imei: req.body.device_serial
  });
  if (socket.io) {
    socket.io.emit(`${GET_DEVICE_PARAMS_EVENT}-${post.device_imei}`, post);
    console.log(
      'emit data ',
      `${GET_DEVICE_PARAMS_EVENT}-${post.device_imei}`,
      post
    );
  }

  doc = await Relay.find({ device_imei: post.device_imei })
    .sort({ _id: -1 })
    .limit(1);

  res.status(200).json({
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

exports.getDeviceMonthlyData = catchAsync(async (req, res, next) => {
  const deviceID = req.query.device_id;
  const year = req.query.year;
  const userId = req.user._id;

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

  const data = await Data.aggregate([
    {
      $match: {
        device_imei: deviceID
      }
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        averagePower: { $avg: '$power' },
        averageCurrent: { $avg: '$current' },
        averageVoltage: { $avg: '$voltage' },
        numberOdTimesLogged: { $sum: 1 }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        month: 1
      }
    }
  ]);

  if (!data || data.length === 0 || data === null || data === undefined)
    return next(new AppError('No records found', 404));

  const months = [
    ,
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  const tranformedData = data.map(el => {
    return { ...el, month: el.month in months ? months[el.month] : el.month };
  });
  res.status(200).json({
    status: 'sucess',
    data: tranformedData
  });
});
exports.getDeviceWeeklyData = catchAsync(async (req, res, next) => {
  const deviceID = req.query.device_id;
  const year = req.query.year;
  const paramWeek = req.query.week;
  console.log('the week is', typeof paramWeek);
  const userId = req.user._id;

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

  const data = await Data.aggregate([
    {
      $match: {
        device_imei: deviceID
      }
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {
          week: { $week: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' }
        },
        // week: { $week: '$createdAt' },
        averagePower: { $avg: '$power' },
        averageCurrent: { $avg: '$current' },
        averageVoltage: { $avg: '$voltage' },
        numberOdTimesLogged: { $sum: 1 }
      }
    },
    // {
    //   $addFields: { week: '$_id' }
    // },

    {
      $project: {
        year: year,
        week: '$_id.week',
        dayOfWeek: '$_id.dayOfWeek',
        averagePower: '$averagePower',
        averageCurrent: '$averageCurrent',
        averageVoltage: '$averageVoltage',
        numberOdTimesLogged: '$numberOdTimesLogged',
        _id: 0
      }
    },
    {
      $match: {
        week: +paramWeek
      }
    },
    {
      $sort: {
        dayOfWeek: 1
      }
    }
  ]);

  if (!data || data.length === 0 || data === null || data === undefined)
    return next(new AppError('No records found', 404));

  const days = [, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const tranformedData = data.map(el => {
    return {
      ...el,
      dayOfWeek: el.dayOfWeek in days ? days[el.dayOfWeek] : el.dayOfWeek
    };
  });
  res.status(200).json({
    status: 'sucess',
    data: tranformedData
  });
});
exports.getDeviceDataByMonth = catchAsync(async (req, res, next) => {
  const deviceID = req.query.device_id;
  const year = req.query.year;
  const paramMonth = req.query.month;
  // console.log('the week is', typeof paramWeek);
  const userId = req.user._id;

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

  const data = await Data.aggregate([
    {
      $match: {
        device_imei: deviceID
      }
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          dayOfMonth: { $dayOfMonth: '$createdAt' }
        },
        // week: { $week: '$createdAt' },
        averagePower: { $avg: '$power' },
        averageCurrent: { $avg: '$current' },
        averageVoltage: { $avg: '$voltage' },
        numberOdTimesLogged: { $sum: 1 }
      }
    },
    // {
    //   $addFields: { week: '$_id' }
    // },

    {
      $project: {
        year: year,
        month: '$_id.month',
        dayOfMonth: '$_id.dayOfMonth',
        averagePower: '$averagePower',
        averageCurrent: '$averageCurrent',
        averageVoltage: '$averageVoltage',
        numberOdTimesLogged: '$numberOdTimesLogged',
        _id: 0
      }
    },
    {
      $match: {
        month: +paramMonth
      }
    }
  ]);

  if (!data || data.length === 0 || data === null || data === undefined)
    return next(new AppError('No records found', 404));

  res.status(200).json({
    status: 'sucess',
    data: data
  });
});
exports.getDataByDay = catchAsync(async (req, res, next) => {
  const deviceID = req.query.device_id;
  const year = req.query.year;
  const paramMonth = req.query.month;
  const paramDay = req.query.day;

  // console.log('the week is', typeof paramWeek);
  const userId = req.user._id;

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

  const data = await Data.aggregate([
    {
      $match: {
        device_imei: deviceID
      }
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          dayOfMonth: { $dayOfMonth: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' },
          hour: { $hour: '$createdAt' }
        },
        // week: { $week: '$createdAt' },
        averagePower: { $avg: '$power' },
        averageCurrent: { $avg: '$current' },
        averageVoltage: { $avg: '$voltage' },
        numberOdTimesLogged: { $sum: 1 }
      }
    },
    // {
    //   $addFields: { week: '$_id' }
    // },

    {
      $project: {
        year: year,
        month: '$_id.month',
        dayOfMonth: '$_id.dayOfMonth',
        dayOfWeek: '$_id.dayOfWeek',
        hour: '$_id.hour',
        averagePower: '$averagePower',
        averageCurrent: '$averageCurrent',
        averageVoltage: '$averageVoltage',
        numberOdTimesLogged: '$numberOdTimesLogged',
        _id: 0
      }
    },
    {
      $match: {
        month: +paramMonth,
        dayOfMonth: +paramDay
      }
    }
  ]);

  if (!data || data.length === 0 || data === null || data === undefined)
    return next(new AppError('No records found', 404));
  const hours = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00'
  ];
  const days = [, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const tranformedData = data.map(el => {
    return {
      ...el,
      dayOfWeek: el.dayOfWeek in days ? days[el.dayOfWeek] : el.dayOfWeek,
      hour: el.hour in hours ? hours[el.hour] : el.hour
    };
  });
  res.status(200).json({
    status: 'sucess',
    data: tranformedData
  });
});
exports.getRealtimeData = catchAsync(async (req, res, next) => {
  const deviceID = req.query.device_id;
  const year = req.query.year;
  const paramMonth = req.query.month;
  const paramDay = req.query.day;

  process.env.TZ = 'Africa/Kampala';
  console.log(new Date().toString());
  const userId = req.user._id;

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
  Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000);
    return this;
  };

  const data = await Data.aggregate([
    {
      $match: {
        device_imei: deviceID
      }
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(moment(`${year}-01-01`)).addHours(3),
          $lte: new Date(moment(`${year}-12-31`)).addHours(3)
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          dayOfMonth: { $dayOfMonth: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' },
          hour: { $hour: '$createdAt' },
          minute: { $minute: '$createdAt' }
        },
        // week: { $week: '$createdAt' },
        averagePower: { $avg: '$power' },
        averageCurrent: { $avg: '$current' },
        averageVoltage: { $avg: '$voltage' },
        numberOdTimesLogged: { $sum: 1 }
      }
    },
    // {
    //   $addFields: { week: '$_id' }
    // },

    {
      $project: {
        year: year,
        month: '$_id.month',
        dayOfMonth: '$_id.dayOfMonth',
        dayOfWeek: '$_id.dayOfWeek',
        hour: '$_id.hour',
        minute: '$_id.minute',
        averagePower: '$averagePower',
        averageCurrent: '$averageCurrent',
        averageVoltage: '$averageVoltage',
        numberOdTimesLogged: '$numberOdTimesLogged',
        _id: 0
      }
    },
    {
      $match: {
        month: +paramMonth,
        dayOfMonth: +paramDay
      }
    }
  ]);

  if (!data || data.length === 0 || data === null || data === undefined)
    return next(new AppError('No records found', 404));
  const hours = [
    '00:',
    '01:',
    '02:',
    '03:',
    '04:',
    '05:',
    '06:',
    '07:',
    '08:',
    '09:',
    '10:',
    '11:',
    '12:',
    '13:',
    '14:',
    '15:',
    '16:',
    '17:',
    '18:',
    '19:',
    '20:',
    '21:',
    '22:',
    '23:'
  ];

  const days = [, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const tranformedData = data.map(el => {
    return {
      ...el,
      dayOfWeek: el.dayOfWeek in days ? days[el.dayOfWeek] : el.dayOfWeek,
      time: el.hour in hours ? hours[el.hour] + `${el.minute}` : el.hour
    };
  });
  res.status(200).json({
    status: 'sucess',
    data: tranformedData
  });
});
exports.getDeviceAnnualData = catchAsync(async (req, res, next) => {
  const deviceID = req.query.device_id;
  const year = req.query.year;
  const userId = req.user._id;

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

  const data = await Data.aggregate([
    {
      $match: {
        device_imei: deviceID
      }
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $year: '$createdAt' },
        averagePower: { $avg: '$power' },
        averageCurrent: { $avg: '$current' },
        averageVoltage: { $avg: '$voltage' },
        numberOdTimesLogged: { $sum: 1 }
      }
    },
    {
      $addFields: { year: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    }
  ]);
  if (!data || data.length === 0 || data === null || data === undefined)
    return next(new AppError('No records found', 404));
  res.status(200).json({
    status: 'sucess',
    data
  });
});

exports.getDeviceLogs = catchAsync(async (req, res, next) => {
  const user = req.user;
  const deviceID = req.params.id;
  console.log('data reveice', user, deviceID);
  const device = await Device.findOne({
    owner: user._id,
    device_imei: deviceID
  });
  if (!device) {
    return next(
      new AppError('You cant access data of a device you dont own', 403)
    );
  }

  const logs = await Data.find({ device_imei: deviceID }).sort({ _id: -1 });
  res.status(200).json({
    status: 'success',
    logs
  });

  res;
});
