var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var schema = mongoose.Schema({
  id: false,
  projectId: { type: String, index: {required: true}},
  threadDate: { type: Date, required: true },
  comments: [{
    date: { type: Date, required: true },
    user: {
      id: { type: ObjectId, required: true },
      name: { type: String, required: true }
    },
    text: { type: String, required: true }
  }]
});

schema.index({ threadDate: -1 });

schema.set('toJSON', {
     transform: function (doc, ret, options) {
         ret.threadId = ret._id;
         delete ret._id;
     }
}); 

module.exports = mongoose.model('Comments', schema);
