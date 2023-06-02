const express = require('express');
const ctl = require('./controller.js');
const router = express.Router();

const {
    isLoggedIn,
    isTeacher
} = require('../middlewares');

// ctl.checkFolder

router.get('/', isLoggedIn, ctl.index)
router.post('/find', isLoggedIn, ctl.findBoard)

module.exports = router;