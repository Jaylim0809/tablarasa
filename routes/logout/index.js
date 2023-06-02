const express = require("express");
const router = express.Router();

const ctl = require("./controller")

const {
  isLoggedIn,
  isNotLoggedIn
} = require('../middlewares');

// 로그아웃 시키기
router.get('/', isLoggedIn, ctl.logout);

module.exports = router;