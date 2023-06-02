const User = require("../../js/models/user");

const index = function (req, res, next) {
    if (req.session.user.role == 3) {return res.render('home/student')}
    res.redirect('upload');
}

module.exports = {
    index: index
}