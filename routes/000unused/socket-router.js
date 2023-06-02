var express = require("express");
var passport = require("passport");
var User = require("../js/models/user");
var {Lesson, Board} = require("../js/models/lesson");
var router = express.Router();

const {
  isLoggedIn,
  isNotLoggedIn
} = require('./middlewares');

let rooms= {}
global.rooms = rooms;

router.get('/board', (req, res) => {
     res.render('../views/board/board', { rooms: rooms })
 })

router.post('/board/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/board')
    }
    rooms[req.body.room] = { users: {}, usersNo: {} }
    res.redirect('/board/'+req.body.room, { userNo: userNoDisplay })
        // Send message that new room was created
    console.log(socket.id)
    let io = req.app.get('io');
    io.emit('room-created', req.body.room)

})
```
router.get('/board/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('../views/board/room', { roomName: req.params.room })
})

module.exports = router;