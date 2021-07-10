const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'you must supply name']
    },
    id: {
      type: String,
      required: [true, 'you must suppy a id value']
    },
    region: {
      type: String,
      required: [true, 'you must suppy a region value']
    },
    size: {
      type: String,
    //   required: [true, 'you must suppy a size  value']
    },
    size_units: {
      type: String,
    //   required: [true, 'you must suppy a size unit value']
    },
    townstatus: {
      type: String,

    //   required: [true, 'you must suppy a town status']
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

districtSchema.pre('save', async function(next) {
  this.power = this.current * this.voltage;
  next();
});

const District = mongoose.model('District', districtSchema);
module.exports = District;
