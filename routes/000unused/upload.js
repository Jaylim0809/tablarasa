const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Task = require("../js/models/lesson").Task;

const {
    isLoggedIn,
    isNotLoggedIn,
    isTeacher
} = require('./middlewares');

fs.readdir('public/uploads', (err) => {
    if (err) {
        console.error('uploads 폴더가 없어 새로 생성합니다.')
        fs.mkdirSync('public/uploads')
    }
})

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'public/uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
})

router.get('/', isLoggedIn, isTeacher, async (req, res) => {
    const tasks = await Task.find().sort({
        datetime: 'desc'
    })
    res.render('upload/index', {
        tasks: tasks
    })
})

router.post('/save', isLoggedIn, isTeacher, upload.single('file'), (req, res, next) => {
    req.task = new Task()
    next()
}, saveTaskAndRedirect('new'))

function saveTaskAndRedirect(path) {
    return async (req, res) => {
        let task = req.task
        task.datetime = Date.now()
        task.email = req.session.email
        task.grade = req.body.grade
        task.subject = req.body.subject
        task.lesson = req.body.lesson
        task.sublesson = req.body.sublesson
        task.activity1 = req.body.activity1
        task.activity2 = req.body.activity2
        task.activity3 = req.body.activity3
        task.activity4 = req.body.activity4
        task.activity5 = req.body.activity5
        task.activity6 = req.body.activity6
        if (req.file) {
            task.path = `public/uploads/${req.file.filename}` // 이미지 자료 저장 경로
        } else {
            task.path = null
        }
        task.activation = req.body.activation

        try {
            task = await task.save()
            res.redirect('/upload')
            // res.redirect(`/upload/${task.datetime}`)
        } catch (e) {
            console.log(e)
            res.redirect('/upload')
        }
    }
}

module.exports = router;