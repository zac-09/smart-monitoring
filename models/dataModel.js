const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema(
  {
    current: {
      type: Number,
      required: [true, 'you must suppy a current value']
    },
    voltage: {
      type: Number,
      required: [true, 'you must suppy a voltage value']
    },
    createdAt: {
      type: Date,
      value: Date.now
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

const Data = mongoose.model('Data', dataSchema);
module.exports = Data;
