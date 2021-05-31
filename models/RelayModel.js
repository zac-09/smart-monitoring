const mongoose = require('mongoose');

const relaySchema = new mongoose.Schema(
  {
    relay_1: {
      type: Number,
      required: [true, 'you must suppy a current value'],
      default: 0
    },
    relay_2: {
      type: Number,
      required: [true, 'you must suppy a voltage value'],
      default: 0

    },
    createdAt: {
      type: Date,
      value: Date.now
    }
  

  },
  {
    toJSON: { virtuals: true },
    toObject: { value: true }
  }
);








const Relay = mongoose.model('Relay', relaySchema);
module.exports = Relay;
