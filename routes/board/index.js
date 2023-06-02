const express = require('express');
const ctl = require('./controller.js');
const router = express.Router();

const {
    isLoggedIn
  } = require('../middlewares');

router.get('/', isLoggedIn, ctl.index)
router.get('/:accessCode', isLoggedIn, ctl.start)
router.get('/:accessCode/:group/:activity', isLoggedIn, ctl.paint)
router.post('/:accessCode/run', isLoggedIn, ctl.teacherStart)
router.post('/:accessCode/save', isLoggedIn, ctl.save)

module.exports = router;