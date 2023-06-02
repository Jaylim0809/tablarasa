const useLocal = require('./local');
var User = require("../models/user");

module.exports = function (passport) {
  
  //사용자 개체를 id로 전환
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });
  
  //id를 사용자 개체로 전환
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  useLocal(passport);
};