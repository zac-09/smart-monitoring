const mongoose = require('mongoose');

const relaySchema = new mongoose.Schema(
  {
    device_imei: {
      type: mongoose.Schema.ObjectId,
      ref: 'Device',
      required: [true, 'you must supply a device imei']
    },
    relay: {
      type: Number,
      required: [true, 'you must suppy a current value'],
      default: 0
    },

    createdAt: {
      type: Date,
      value: Date.now()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { value: true }
  }
);

const Relay = mongoose.model('Relay', relaySchema);
module.exports = Relay;
