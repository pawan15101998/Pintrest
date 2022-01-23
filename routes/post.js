var mongoose = require('mongoose')


var postSchema = mongoose.Schema({
  image: String,
  title: String,
  about: String,
  explain: String,
  desc: String,
  comments: [{type: mongoose.Schema.Types.ObjectId, ref:"comment"}],
  user: {type: mongoose.Schema.Types.ObjectId ,ref: "user", default: Array},
  like:[
    {type: Array,
    default:0}
  ],
  time: { type:Date,  
        default: Date.now()}
})                                


module.exports = mongoose.model('post', postSchema)