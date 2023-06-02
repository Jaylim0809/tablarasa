const express = require('express');
const ctl = require('./controller.js');
const router = express.Router();

const {
    isLoggedIn,
    isNotLoggedIn,
    isTeacher
} = require('../middlewares');

// ctl.checkFolder

router.get('/', isLoggedIn, isTeacher, ctl.index)
router.get('/random', isLoggedIn, isTeacher, ctl.random)
router.post('/active', isLoggedIn, isTeacher, ctl.activeTask)
router.post('/update', isLoggedIn, isTeacher, ctl.upload.single('file'), ctl.updateTask)
router.post('/delete', isLoggedIn, isTeacher, ctl.deleteTask)
router.post('/find',isLoggedIn, isTeacher, ctl.findTask)
router.post('/save', isLoggedIn, isTeacher, ctl.upload.single('file'), ctl.newTask, ctl.saveTaskAndRedirect)

module.exports = router;