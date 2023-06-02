const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require("../../js/models/lesson").Task;

// const checkFolder = fs.readdir('public/uploads', (err) => {
//     if (err) {
//         console.error('uploads 폴더가 없어 새로 생성합니다.')
//         fs.mkdirSync('public/uploads')
//     }
// })

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

const index = async (req, res) => {
    const tasks = await Task.find().sort({
        activeGrade: -1,
        activeClassroom: -1,
        datetime: -1
    })
    res.render('upload/index', {
        tasks: tasks
    })
}

const random = async (req, res, next) => {
    let randomCode = String(Math.floor(Math.random() * 999999));
    try {
        await Task.findOne({
            accessCode: randomCode
        }).exec((err, task) => {
            if (err) {
                throw err
            } else {
                if (task) return random();
                console.log(randomCode);
                res.json(randomCode);
                return
            }
        })
    } catch (err) {
        console.error(err)
        res.redirect('/upload')
        // next(err)
    }
}

const findTask = async (req, res, next) => {
    try {
        await Task.findOne({
            accessCode: req.body.accessCode
        }).exec((err, task) => {
            if (err) {
                throw err
            } else {
                console.log(task)
                res.json(task);
            }
        })
    } catch (err) {
        console.error(err)
        res.redirect('/upload')
        // next(err)
    }
}

const activeTask = async (req, res, next) => {
    console.log(req.body.activeGrade)

    await Task.findOneAndUpdate({
        accessCode: req.body.accessCode
    }, {
        activeGrade: req.body.activeGrade,
        activeClassroom: req.body.activeClassroom,
        activeGroup: req.body.activeGroup
    }, {
        multi: true,
        new: true
    }).exec((err, task) => {
        console.log(task)
        console.log(task.activeGrade)
    })

    res.redirect('/')
}

const updateTask = async (req, res, next) => {

    // if (req.file) {
    //     task.path = `public/uploads/${req.file.filename}` // 이미지 자료 저장 경로
    // } else {
    //     task.path = null
    // }

    await Task.findOneAndUpdate({
        accessCode: req.body.accessCode
    }, {
        datetime: Date.now(),
        email: req.session.user.email,
        grade: req.body.grade,
        subject: req.body.subject,
        lesson: req.body.lesson,
        sublesson: req.body.sublesson,
        activity: {
            a1: req.body.activity1,
            a2: req.body.activity2,
            a3: req.body.activity3,
            a4: req.body.activity4,
            a5: req.body.activity5,
            a6: req.body.activity6
        }
    })

    res.redirect('/')
}

const editTask = async (req, res, next) => {
    try {
        console.log('req.body.accessCode:' + req);
        await Task.findOne({
            accessCode: req.body.accessCode
        }).exec((err, task) => {
            console.log('task:' + task);
            res.json(task);
            return
        })
    } catch (err) {
        console.error(err)
    }
}

const deleteTask = async (req, res) => {
    try {
        console.log('req.body.accessCode' + req.body.accessCode);
        await Task.findOne({
            accessCode: req.body.accessCode
        }).exec((err, task) => {
            if (err) {throw err}
        })

        await Task.findOneAndDelete({
            accessCode: req.body.accessCode
        }).exec((err, task) => {
            if (err) {
                throw err
            } else {
                if (task.path && fs.readFileSync(task.path)) {
                    fs.unlink(task.path, (err) => {
                        if (err) throw err
                    })
                }
                console.log("delete : ", task, task.path)
                res.redirect('/upload')
            }
        })

    } catch (err) {
        console.log(err)
        res.redirect('/upload')
    }
}

const newTask = (req, res, next) => {
    req.task = new Task()
    next()
}

const saveTaskAndRedirect = async (req, res) => {
    let task = req.task
    task.datetime = Date.now()
    task.accessCode = req.body.accessCode
    task.email = req.session.user.email
    task.grade = req.body.grade
    task.subject = req.body.subject
    task.lesson = req.body.lesson
    task.sublesson = req.body.sublesson
    task.activity.a1 = req.body.activity1
    task.activity.a2 = req.body.activity2
    task.activity.a3 = req.body.activity3
    task.activity.a4 = req.body.activity4
    task.activity.a5 = req.body.activity5
    task.activity.a6 = req.body.activity6
    if (req.file) {
        task.path = `public/uploads/${req.file.filename}` // 이미지 자료 저장 경로
    } else {
        task.path = null
    }

    try {
        task = await task.save()
        res.redirect('/')
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

module.exports = {
    index: index,
    random: random,
    activeTask: activeTask,
    updateTask: updateTask,
    editTask: editTask,
    findTask: findTask,
    deleteTask: deleteTask,
    // checkFolder: checkFolder,
    upload: upload,
    newTask: newTask,
    saveTaskAndRedirect: saveTaskAndRedirect
}