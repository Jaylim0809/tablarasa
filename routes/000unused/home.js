var express = require('express');
var router = express.Router();
var User = require("../js/models/user");
const {
  isLoggedIn,
  isNotLoggedIn
} = require('./middlewares');

/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
  User.find().sort({
      createAt: "descending"
    })
    .exec(function (err, users) {
      if (err) {
        return next(err);
      }
      console.log(req.session.email);
      res.render('home', {
        users: users
      });
    });
});

module.exports = router;