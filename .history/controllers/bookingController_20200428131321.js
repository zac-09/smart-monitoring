const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });
  res.status(200).json({
    status: 'success',
    session: session
  });
});

exports.createBookingCheckout = (req,res,next) =>{
    const {tour,user,price} = req.query;
    if(!tour &&!user &&!price) return next()
}