const express = require('express');
const ctl = require('./controller.js');
const router = express.Router();

const {
  isLoggedIn,
  isNotLoggedIn
} = require('../middlewares');

/* GET home page. */
router.get('/', isNotLoggedIn, ctl.index);
router.post('/', ctl.userSave);

module.exports = router;