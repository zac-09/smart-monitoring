// import controller from './../controllers/dataController'
const controller = require('./../controllers/dataController');
const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/', controller.createData);
router.get('/getDeviceData', authController.protect, controller.getDeviceData);

module.exports = router;
