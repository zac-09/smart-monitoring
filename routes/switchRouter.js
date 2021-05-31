// import controller from './../controllers/dataController'
const controller = require('./../controllers/switchController')
const express = require('express');


const router = express.Router();


router.post("/",controller.updateStatus);



module.exports = router