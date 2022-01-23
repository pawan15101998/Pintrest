var mongoose = require('mongoose')

var commentSchema= mongoose.Schema({
  comment:String, 
  post:{type: mongoose.Schema.Types.ObjectId, ref: 'post'},
  likes: [
      {
          type:Array,
          default: 0
      }
  ]
});

module.exports = mongoose.model('comment', commentSchema);