var express = require("express");
const passport = require("passport");
var router = express.Router();
const send = require("./nodemailer");
var userModel = require("./users");
var postModel = require("./post");
var commentModel = require("./comment");
var localStrategy = require("passport-local");
const { populate } = require("./post");
var multer = require("multer");



passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload",isLoggedIn, upload.single("file"), function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (fu) {
      postModel.create({
          image: req.file.filename,
          title: req.body.title,
          about: req.body.about,
          explain: req.body.explain,
          desc: req.body.desc,
          user: fu._id  
        })
        .then(function (cp) {
          fu.post.push(cp._id);
          fu.save().then(function () {
            res.send(cp);
          });
        });
    });
});



router.get("/createpost",isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (fu) {
      res.render("createpost", { fu });
    });
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/otheruserprofile", isLoggedIn, function (req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(lu){
    res.render('otheruserprofile', {lu})
  })
});

router.get("/login", function (req, res, next) {
  res.render("loginn");
});

router.get("/register", function (req, res, next) {
  res.render("registern");
});

router.post("/register", function (req, res, next) {
  var newUser = new userModel({
    name: req.body.name,
    username: req.body.username,
    image: req.body.file,
    email: req.body.email,
  });
  userModel
    .register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function (e) {
      res.send(e);
    });
});

router.get("/profile",isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (lu) {
      postModel
        .find()
        .populate("user")
        .then(function (allpost) {
          res.render("profile", { lu, allpost });
        });
    });
});

router.post("/login",passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.get("/delete/:id",isLoggedIn, function (req, res) {
  postModel.findOneAndDelete({ id: req.params.id })
    .then(function (deleted) {
    res.redirect("/profile");
  });
});

router.get('/userprofile', isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(lu){
    
  })
})

router.get("/userprofile/:id",isLoggedIn, function(req, res) {
  userModel.findOne({username: req.session.passport.user})
  .populate('follower')
  .populate('post')
  .populate('savepost')
  .then(function(fu){
  postModel.findOne({_id: req.params.id})
  .populate('user')
   .then(function(fp){
    res.render('userprofile', {fu ,fp})
   }) 
  })
});

router.get("/setting",isLoggedIn, function (req, res) {
  res.render("setting");
});

router.get("/todaypost",isLoggedIn, function (req, res) {
 userModel.findOne({username: req.session.passport.user})
 .populate('post')
 .then(function(fu){
  fpost = fu.post.filter(f => {
    console.log(new Date(new Date(f.time).getTime() + 60 * 60 * 24 * 1000))
    console.log(new Date())
    console.log(new Date(new Date(f.time).getTime() + 60 * 60 * 24 * 1000) >  new Date())
    return new Date(new Date(f.time).getTime() + 60 * 60 * 24 * 1000) >  new Date()
  })
   res.render('today', {fu});
 })
 
});

router.get("/save/:id",isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
  // .populate('savepost')
    .then(function(founduser){
      postModel.findOne({ _id: req.params.id })
      .then(function (fp) {
        if(founduser.savepost.indexOf(fp._id) === -1){
          founduser.savepost.push(fp._id);
        } else{
          var save = founduser.savepost.indexOf(fp._id)
            founduser.savepost.splice(save, 1)
        }
        founduser.save().then(function (val) {
          // res.send(val)
          res.redirect(req.headers.referer)
        });
      });
    });
});

router.get('/like/:id', isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(fu){
    postModel.findOne({_id: req.params.id})
    .then(function(fp){
      if(fp.like.indexOf(fu._id) === -1){
        fp.like.push(fu._id)
      }else{
        var ind = fp.like.indexOf(fu._id)
        fp.like.splice('ind', 1)
      }
      fp.save()
      .then(function(){
        res.redirect(req.headers.referer)
      })
    })
  })
})

router.get("/userpic/:id", function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
  .populate('savepost')
    .then(function (founduser) {
      postModel.findOne({ _id: req.params.id })
      .populate('user')
      .then(function (foundpost){
        postModel.find()
        .then(function(allpost){
          res.render("userpic", { foundpost, founduser, allpost });
        })        
      });
      }); 
    });

router.get("/follow/:id",isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (founduser) {
      postModel.findOne({ _id: req.params.id })
      .then(function (fp) {
        userModel.findOne({ _id: fp.user._id })
        .then(function(postuser) {
          if(postuser.follower.indexOf(founduser._id) == -1 && founduser.following.indexOf(postuser._id)== -1) {
            postuser.follower.push(founduser._id);
            founduser.following.push(postuser._id);
          } else {
            var pos = postuser.follower.indexOf(founduser._id);
            var pos2 = founduser.following.indexOf(postuser._id);
            postuser.follower.splice(pos, 1);
            founduser.following.splice(pos2, 1);
          }
          postuser.save()
          .then(function (val) {
            founduser.save()
            .then(function(val2){
              res.send(founduser);
            })
            // res.redirect(req.headers.referer)
          });
        });
      });
    });
});



router.get('/unfollow/:id',isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(fu){
userModel.findOne({_id: req.params.id})
.then(function(folluser){
  if(fu.follower.indexOf(folluser._id)==-1){
    fu.follower.push(folluser._id)
  }else{
    var followuser = fu.follower.indexOf(folluser._id)
    fu.follower.splice(folluser, 1)
  }
  fu.save()
  .then(function(val){
res.redirect(req.headers.referer)
  })
})
  })
})

// router.post('/upload', function(req, res){

// })

router.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}

module.exports = router;
