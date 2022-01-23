var mongoose = require('mongoose')
var plm = require('passport-local-mongoose')
var db="mongodb+srv://pinclone:Pawan@cluster0.5ygdp.mongodb.net/pin?retryWrites=true&w=majority"
mongoose.connect(db)

var userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password:String,
  follower: [{type: mongoose.Schema.Types.ObjectId,
     ref:"user"}],
  following: [{type: mongoose.Schema.Types.ObjectId,
     ref:"user"}],
  post: [{type: mongoose.Schema.Types.ObjectId ,
    ref: "post"}],
  savepost: [{type: mongoose.Schema.Types.ObjectId, ref: "post"}]
})

userSchema.plugin(plm)
module.exports = mongoose.model('user', userSchema)