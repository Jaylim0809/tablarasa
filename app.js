// 2020. 5. 13. update
// add board
// new  layout 
// lim jong woo
// lee
// add issue
const createError = require('http-errors');
const express = require('express');

const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require("connect-flash");
const logger = require('morgan');
const passport = require('passport');
const setUpPassport = require("./js/passport/setup-passport");

const routeBundle = require('./routes/routeBundle');
const config = require('./config.json').development;

const app = express();
setUpPassport(passport);

app.set("port",config.PORT || process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:false}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({   //
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

routeBundle(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    console.log(err)
    
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;