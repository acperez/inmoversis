var mongoose = require('mongoose');

module.exports = mongoose.model('PendingKYC', {
  user: { type: String, index: { unique: true , required: true } },
  ip: { type: String, required: true },
  date: { type: Date, required: true }
});
