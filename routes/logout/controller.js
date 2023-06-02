var passport = require("passport");
var User = require("../../js/models/user");

/* GET home page. */
const logout = function (req, res, next) {
    req.logout();
    res.render('login/index');
}

module.exports = {
    logout: logout
}