const passport = require("passport");
const User = require("../../js/models/user");

/* GET home page. */
const index = (req, res, next) => {
  res.render('login/index');
}

const login =  (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if(err) return next(err)

    if(!user) return res.render('login/index', {infos: info.message})

    req.logIn(user, err => {
      if(err) {return next(err)}
      req.session.user = {}
      req.session.user.email = user.email // req.session에 이메일 저장
      req.session.user.role = user.role // req.session에 역할 저장
      req.session.user.grade = user.grade
      req.session.user.classroom = user.classroom
      req.session.user.username = user.username
      req.session.user.number = user.number
      console.log(req.session.user)
      return res.redirect('/')
    })
  })(req, res, next);
}

module.exports = {
    index: index,
    login: login
}