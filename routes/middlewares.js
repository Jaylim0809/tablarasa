exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
};

exports.isTeacher = (req, res, next) => {
    if (req.session.user.role == 1 || req.session.user.role == 2) {
        next();
    } else {
        res.redirect('/');
    }
};
