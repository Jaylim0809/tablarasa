const passport = require("passport");
const User = require("../../js/models/user");

const index = (req, res, next) => {
    res.render('register/index');
}

const userSave = (req, res, next) => {
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var grade = req.body.grade;
    var classroom = req.body.classroom;
    var number = req.body.number;
    var role = req.body.role;
    var activation = false;
    var provider = 'local';
    var snsId = null;
    User.findOne({
        email: email
    }, (err, user) => {
        if (err) {
            console.error("데이터 베이스에서 유저 정보를 찾는데 실패했습니다.", err);
            return next(err);
        }
        if (user) {
            console.error("db에 사용자가 이미 있습니다.", err);
            req.flash("error", "사용자가 이미 있습니다.");
            return res.redirect("/register");
        }
        var newUser = new User({
            email: email,
            username: username,
            password: password,
            grade: grade,
            classroom: classroom,
            number: number,
            role: role,
            activation: activation,
            provider: provider,
            snsId: snsId
        });
        newUser.save();
        res.redirect('/');
    });
}

module.exports = {
    index: index,
    userSave: userSave
}