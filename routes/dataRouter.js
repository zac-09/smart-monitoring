// import controller from './../controllers/dataController'
const controller = require('./../controllers/dataController');
const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/postData', controller.createData);
router.use(authController.protect);
router.get('/getDeviceData', controller.getDeviceData);
router.get('/getDeviceLogs/:id', controller.getDeviceLogs);

router.get('/getDeviceStats/monthly', controller.getDeviceMonthlyData);
router.get('/getDeviceStats/annual', controller.getDeviceAnnualData);
router.get('/getDeviceStats/weekly', controller.getDeviceWeeklyData);
router.get('/getDeviceStats/byMonth', controller.getDeviceDataByMonth);
router.get('/getDeviceStats/byDay', controller.getDataByDay);
router.get('/getDeviceStats/realtime', controller.getRealtimeData);

module.exports = router;
