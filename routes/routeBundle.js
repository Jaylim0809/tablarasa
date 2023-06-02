let resLocals = require('./res-locals');
const homeRouter = require('./home/index');
const loginRouter = require('./login/index');
const logoutRouter = require('./logout/index');
const registerRouter = require('./register/index');
const boardRouter = require('./board/index');
const uploadRouter = require('./upload/index');
const resultRouter = require('./result/index');

module.exports = (app) => {
    app.use(resLocals);
    app.use('/', homeRouter);
    app.use('/login', loginRouter);
    app.use('/logout', logoutRouter);
    app.use('/register', registerRouter);
    app.use('/board', boardRouter);
    app.use('/upload', uploadRouter);
    app.use('/result', resultRouter);
}