var User = require("../models/user");
var LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email', //req.body에 어떠한 이름으로 원하는 정보가 담겨져 있나를 보는 것임. req.body.email 이면 'email'이라고 적어줌.
        passwordField: 'password' // view 파일 내 form의 name에서 설정함.
    }, async (email, password, done) => {

        console.log('로컬 로그인 시작')

        const user = await User.findOne({
            email: email
        });

        console.log(user)

        try {
            if (!user) {
                return done(null, false, {
                    message: "가입되지 않은 이메일입니다."
                });
            }
        } catch (err) {
            console.error(err);
            return done(err);
        }

        user.checkPassword(password, (err, isSame) => {
            if (err) {
                console.log(err);
                return done(err);
            }
            if (isSame) {
                console.log('암호 일치')
                return done(null, user);
            } else {
                console.log('암호 불일치')
                return done(null, false, {
                    message: "암호가 일치하지 않습니다."
                });
            }
        });
    }));
};