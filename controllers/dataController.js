const catchAsync = require( './../utils/catchAsync')
const Data = require('./../models/dataModel');
const Relay = require('./../models/RelayModel')
exports.createData = catchAsync(async (req,res,next) =>{
post = await Data.create(req.body)
doc = await Relay.find().sort({_id:-1}).limit(1)
console.log(doc)
res.status(201).json({
    status: 'success',
    data: {
      doc
    }
  });


})  