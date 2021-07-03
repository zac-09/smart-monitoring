const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  device_name: {
    type: String,
    required: [true, 'Device must have a name']
  }, 
  device_imei: {
    type: mongoose.Schema.ObjectId
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    }
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'device must belong to a registered user']
  },
  status: {
    type: String,
    enum: ['active', 'offline']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});
deviceSchema.pre('save', async function(next) {
  this.device_imei = this._id;
  next();
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
