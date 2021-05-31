// import controller from './../controllers/dataController'
const controller = require('./../controllers/dataController')
const express = require('express');


const router = express.Router();


router.post("/",controller.createData);



module.exports = router