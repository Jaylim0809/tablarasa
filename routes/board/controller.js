const User = require("../../js/models/user");
const Task = require("../../js/models/lesson").Task;
const Board = require("../../js/models/lesson").Board;

const index = async (req, res, next) => {
    let sObj
    if (req.session.user.role == 3) {
        sObj = {
            activeGrade: req.session.user.grade,
            activeClassroom: req.session.user.classroom
        }
    } else {
        sObj = {
            activeGrade: {
                $exists: true
            },
            activeClassroom: {
                $exists: true,
                $gt: 0
            }
        }
    }

    try {
        await Task.find(sObj).exec((err, tasks) => {
            if (err) {
                throw err
            } else {

                if (req.session.user.role == 3) {
                    return res.render('board/index-student', {
                        tasks: tasks
                    });
                }
                return res.render('board/index', {
                    tasks: tasks
                });
            }
        })
    } catch (err) {
        console.error(err)
        //res.redirect('/')
        next(err)
    }
}

const start = async (req, res) => {
    //req.app.get('io').emit('task-started', req.params.accessCode)

    await Task.findOne({
        accessCode: req.params.accessCode
    }).exec((err, task) => {

        if (req.session.user.role == 3) {
            res.render('board/start', {
                task: task,
                userEmail: req.session.user.email,
                userName: req.session.user.username,
                activity: Object.values(task.activity).filter((a) => {
                    return a !== null && a !== undefined && a !== "" && a !== true
                })
            })
        } else {
            res.render('board/start-teacher', {
                task: task,
                userEmail: req.session.user.email,
                userName: req.session.user.username,
                activity: Object.values(task.activity).filter((a) => {
                    return a !== null && a !== undefined && a !== "" && a !== true
                })
            })
        }
    })
}

const teacherStart = (req, res) => {
    res.redirect(`/board/${req.params.accessCode}/${req.body.group}/${req.body.activity}`)
}

const paint = async (req, res) => {
    await Task.findOne({
        accessCode: req.params.accessCode
    }).exec((err, task) => {
        let activity = Object.values(task.activity).filter((a) => {
            return a !== null && a !== undefined && a !== "" && a !== true
        })

        res.render('board/paint', {
            task: task,
            path: task.path,
            userEmail: req.session.user.email,
            userName: req.session.user.username,
            group: req.params.group,
            activityNumber: req.params.activity,
            activity: activity,
            activityName: activity[req.params.activity - 1]
        })
    })
}

const save = async (req, res) => {
    await User.findOne({
        email: req.body.email
    }).exec((err, user) => {

        let boardData = req.body.boardData; // JSON.parse(req.body.boardData);
        let board = new Board({
            email: req.body.email,
            username: user.username,
            grade: user.grade,
            classroom: user.classroom,
            number: user.number,
            datetime: Date.now(),
            board: boardData,
            accessCode: req.params.accessCode,
            activity: req.body.activityName
        })
        board.save();
    })
}

module.exports = {
    index: index,
    start: start,
    teacherStart: teacherStart,
    paint: paint,
    save: save
}