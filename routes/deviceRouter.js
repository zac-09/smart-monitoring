const authController = require('./../controllers/authController');
const express = require('express');
const router = express.Router();

const deviceController = require('./../controllers/deviceController');
router.post(
  '/registerDevice',
  authController.protect,
  authController.restrictTo('admin'),
  deviceController.registerDevice
);
router.delete(
  '/deleteDevice',
  authController.protect,
  deviceController.deleteDevice
);
router.put(
  '/updateDevice',
  authController.protect,
  deviceController.updateDevice
);
router.get(
  '/getAll',
  authController.protect,
  deviceController.getAllUserDevices
);

module.exports = router;
