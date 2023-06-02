const express = require('express');
const ctl = require('./controller.js')
const router = express.Router();

const {
  isLoggedIn,
  isNotLoggedIn
} = require('./middlewares');

let rooms= {}
global.rooms = rooms;

router.get('/board', ctl.index)
router.post('/board/room', ctl.room)
router.get('/board/:room', ctl.roomIn)

module.exports = router;