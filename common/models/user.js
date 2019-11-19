var mongoose = require('mongoose');

var CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  cif: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },
  country: { type: String, required: true }
});

mongoose.model('Company', CompanySchema);

var PhoneSchema = new mongoose.Schema({
  number: { type: String, required: true },
  isMobile: { type: Boolean, required: true },
  country: { type: String, required: true },
  e164: { type: String, required: true }
});

mongoose.model('Phone', PhoneSchema);

module.exports = mongoose.model('User', {
  ip: { type: String, required: true },
  email: { type: String, index: { unique: true , required: true }},
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, default: null },
  nationality: {type: String, default: null },
  nationalId: {type: String, default: null },
  nationalIdType: {type: String, enum: ['national', 'foreign'], default: 'national'},
  phone: {type: PhoneSchema },
  address: { type: String, default: null },
  postalCode: { type: String, default: null },
  city: { type: String, default: null },
  region: { type: String, default: null },
  country: { type: String, default: null },
  userType: { type: String, enum: ['person', 'company'], default: 'person'},
  investorType: { type: String, enum: ['natural', 'accredited'], default: 'natural'},
  company: { type: [CompanySchema] },
  userStatus: {type: String, enum: [
      'provisional',  // Pending email confirmation
      'guest',        // Email confirmed but data pending
      'identified',   // User data completed
      'validating',   // Validating KYC
      'rejected',     // KYC validation failed
      'member',       // Complete user
      'updating'      // Updating KYC
    ], default: 'guest'},
  creationDate: { type: Date, required: true },
  lastSeen: { type: Date, required: true },
  wallet: { type: String, default: null },
  projects: { type: [String], default: []},
});
