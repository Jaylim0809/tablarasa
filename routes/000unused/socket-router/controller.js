const passport = require('passport');
const User = require('../js/models/user');
const {
    Lesson,
    Board
} = require('../js/models/lesson');

const index = (req, res) => {
    res.render('../views/board/board', {
        rooms: rooms
    })
}

const room = (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/board')
    }
    rooms[req.body.room] = {
        users: {},
        usersNo: {}
    }
    res.redirect('/board/' + req.body.room, {
        userNo: userNoDisplay
    })
    // Send message that new room was created
    console.log(socket.id)
    let io = req.app.get('io');
    io.emit('room-created', req.body.room)
}

const roomIn = (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('../views/board/room', { roomName: req.params.room })
}

module.exports = {
    index: index,
    room: room,
    roomIn: roomIn
}