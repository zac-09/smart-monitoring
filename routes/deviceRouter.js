// const authController = require('./../controllers/authController');
const express = require('express');
const router = express.Router();

const deviceController = require('./../controllers/deviceController');
router.post(
  '/registerDevice',

  deviceController.registerDevice
);

module.exports = router;
