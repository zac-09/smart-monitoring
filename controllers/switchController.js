const catchAsync = require( './../utils/catchAsync')

const Relay = require('./../models/RelayModel')
exports.updateStatus = catchAsync(async (req,res,next) =>{
post = await Relay.create(req.body)
// doc = await Relay.findOne().sort({createdAt:1}).limit(1)
// console.log(doc)
res.status(201).json({
    status: 'success',
    data: {
      post
    }
  });


})  