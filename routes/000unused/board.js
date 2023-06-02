const express = require('express');
const router = express.Router();
const User = require("../js/models/user");
const Board = require("../js/models/lesson").Board;

const {
    isLoggedIn
  } = require('./middlewares');

var taskName

router.get('/', isLoggedIn, (req, res) => {
    res.render('board/index', {
        rooms: rooms
    })
})

router.post('/room', isLoggedIn, (req, res) => {

    console.log(Object.entries(req));
    rooms[req.body.room] = {
        users: {}
    }
    taskName =rooms[req.body.room].users[req.sessionID] = req.body.task
    
    console.log(taskName)

    res.redirect(req.body.room)
    // Send message that new room was created
    req.app.get('io').emit('room-created', req.body.room)
})

router.get('/:room', isLoggedIn, (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('board/paint', {
        roomName: req.params.room,
        taskName: taskName
    })
})

router.post('/save', isLoggedIn, (req, res) => {
    let boardData = JSON.parse(req.body.boardData);
    let board = new Board({
        email: "voltron7@naver.com",
        datetime: Date.now(),
        board: boardData,
        taskSchema: {
            grade: 1,
            subject: "국어",
            lesson: "별곡",
            sublesson: "별곡1",
            activity: "그리기1",
            activation: false
        }
    })
    console.log(board.board.data.objects);
    board.save();
    res.redirect('/board');
})
module.exports = router;