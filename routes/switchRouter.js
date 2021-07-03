// import controller from './../controllers/dataController'
const controller = require('./../controllers/switchController');
const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/', authController.protect, controller.updateStatus); 

router.get('/',  controller.getRelayState);

module.exports = router;
