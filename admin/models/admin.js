var mongoose = require('mongoose');
 
module.exports = mongoose.model('Admin', {
	email: { type: String, index: { unique: true , required: true }},
  password: { type: String, required: true }
});
