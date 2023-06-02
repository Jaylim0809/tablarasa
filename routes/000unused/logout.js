var express = require("express");
var passport = require("passport");
var User = require("../js/models/user");
var router = express.Router();

const {
  isLoggedIn,
  isNotLoggedIn
} = require('./middlewares');

/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
    req.logout();
    res.render('login/index');
  });

module.exports = router;