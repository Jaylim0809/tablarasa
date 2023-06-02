const Board = require("../../js/models/lesson").Board;

const index = async (req, res) => {

    let sObj
    if (req.session.user.role == 3) {
        sObj = {
            grade: req.session.user.grade,
            classroom: req.session.user.classroom,
            number: req.session.user.number
        }
    } else {
        sObj = {
            grade: {
                $exists: true
            },
            classroom: {
                $exists: true
            },
            number: {
                $exists: true
            }
        }
    }

    const boards = await Board.find(sObj).sort({
        datetime: -1,
        number: -1,
        classroom: -1,
        grade: -1
    })

    if (req.session.user.role == 3) {
        return res.render('result/index-student', {
            boards: boards
        })
    }
    return res.render('result/index', {
        boards: boards
    })
}

const findBoard = async (req, res) => {
    try {
        console.log('req.body._id?', req.body._id)

        await Board.findOne({
            _id: req.body._id
        }).exec((err, board) => {
            if (err) {
                throw err
            } else {
                console.log("액시오스를 통해 몽고에서 찾은 board?", board)
                res.json(board)
            }
        })
    } catch (err) {
        console.error(err)
        res.redirect('/result')
    }
}

module.exports = {
    index: index,
    findBoard: findBoard
}