const express = require("express");
const router = express.Router();
const ctl = require("./controller.js")

const {
  isLoggedIn,
  isNotLoggedIn
} = require('../middlewares');

/* GET home page. */
router.get('/', isNotLoggedIn, ctl.index);

router.post("/", ctl.login);

module.exports = router;