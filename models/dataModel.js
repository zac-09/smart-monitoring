const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema(
  {
    device_imei: {
      type: String,
      required: [true, 'you must supply deviceID']
    },
    current: {
      type: Number,
      required: [true, 'you must suppy a current value']
    },
    voltage: {
      type: Number,
      required: [true, 'you must suppy a voltage value']
    },
    power: {
      type: Number
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      }
    },
    toObject: { value: true }
  }
);

dataSchema.pre('save', async function(next) {
  this.power = this.current * this.voltage;
  next();
});

const Data = mongoose.model('Data', dataSchema);
module.exports = Data;
