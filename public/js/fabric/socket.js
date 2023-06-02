const SocketIO = require('socket.io');
const {
    request
} = require('express');

module.exports = function (server, app) {
    let io = SocketIO(server)

    app.set('io', io);

    let tasks
    let tasks2
    let socketID
    let canvasSize = {}
    let activityTime = {}

    io.on('connection', function (socket) {
        console.log('a user connected', socket.id)
        socket.on('new-user', function (accessCode) {
            if (!tasks) tasks = {}

            if (!tasks[accessCode]) tasks[accessCode] = {
                groups: {}
            }
            if (!socketID) socketID = {}
            socketID[socket.id] = {}
            socket.join(accessCode)
            socket.emit('user-connected', tasks)
            // io.to(accessCode).emit('user-connected', tasks)
            // socket.to(accessCode).broadcast.emit('user-connected', tasks)
        })

        socket.on('groupRequestTasks', function (clickedGroupNo) {
            let i = 1
            socket.emit(`groupGetTasks${clickedGroupNo}`, tasks)
        })

        socket.on('activityRequestTasks', function (clickedActivityNo) {
            let i = 1
            socket.emit(`activityGetTasks${clickedActivityNo}`, tasks)
        })

        socket.on('teacherRequestTasks', function (clientSocketID) {
            io.to(clientSocketID).emit('teacherGetTasks', tasks)
        })

        socket.on('teacherStart', function (accessCode, assignedCanvasSize, assignedActivityTime) {
            //canvasSize를 해당 task에 할당
            canvasSize[accessCode] = assignedCanvasSize
            activityTime[accessCode] = assignedActivityTime
            socket.to(accessCode).broadcast.emit('teacherStart')
        })

        socket.on('teacherStop', function (accessCode) {
            delete tasks[accessCode]
            delete tasks2[accessCode]
            io.to(accessCode).emit('teacherStop')
        })

        socket.on('setGroup', function (accessCode, nowGroupNo, clickedGroupNo, userEmail, userName, nowActivityNo) {
            //모둠을 선택한 학생이 없으면 모둠 객체를 생성한다.
            socketID[socket.id] = {
                userEmail: userEmail,
                accessCode: accessCode,
                nowGroupNo: clickedGroupNo,
                nowActivityNo: ""
            }

            if (!tasks[accessCode].groups[clickedGroupNo]) {
                tasks[accessCode].groups[clickedGroupNo] = {
                    users: {}, // 각 모둠에 참가하는 사용자 정보 객체
                    activity: [], // 각 모둠 내 세부활동 목록 배열
                    socketID: []
                }
            }

            //이전에 선택한 모둠이 있다면 기존 모둠에서 정보 삭제
            if (nowGroupNo !== 0) { //첫번째 선택하는 것이면 삭제할 이전 정보가 존재하지 않음
                delete tasks[accessCode].groups[nowGroupNo].users[socket.id]
                //이전 모둠의 세부활동 또한 삭제해야 한다.
                tasks[accessCode].groups[nowGroupNo].activity[nowActivityNo] = null
                tasks[accessCode].groups[nowGroupNo].socketID[nowActivityNo] = null
            }

            //선택한 모둠에 사용자 정보를 저장하고 서버의 tasks를 업데이트한다
            tasks[accessCode].groups[clickedGroupNo].users[socket.id] = {
                userName: userName,
                userEmail: userEmail,
                activity: null
            }

            io.to(accessCode).emit('putSelectGroupName', tasks)
        })

        socket.on('setActivity', function (accessCode, nowGroupNo, preActivityNo, userName, nowActivityNo, activityDetail) {
            if (!tasks[accessCode].groups[nowGroupNo].users[socket.id]) return

            let preActivityUser = tasks[accessCode].groups[nowGroupNo].activity[preActivityNo]
            let preActivitySocketID = tasks[accessCode].groups[nowGroupNo].socketID[preActivityNo]
            let nowActivityUser = tasks[accessCode].groups[nowGroupNo].activity[nowActivityNo]
            let nowActivitySocketID = tasks[accessCode].groups[nowGroupNo].socketID[nowActivityNo]

            //이전에 선택한 활동이 있다면 기존 활동에서 정보 삭제
            if (preActivityNo != 0) {
                preActivityUser = null
                preActivitySockekID = null
            }

            //선택한 모둠에 사용자 정보를 저장하고 서버의 tasks를 업데이트한다

            tasks[accessCode].groups[nowGroupNo].users[socket.id].activity = activityDetail[nowActivityNo - 1]
            nowActivityUser = userName
            nowActivitySocketID = socket.id
            socketID[socket.id].nowActivityNo = nowActivityNo

            tasks[accessCode].groups[nowGroupNo].activity[preActivityNo] = preActivityUser
            tasks[accessCode].groups[nowGroupNo].socketID[preActivityNo] = preActivitySocketID
            tasks[accessCode].groups[nowGroupNo].activity[nowActivityNo] = nowActivityUser
            tasks[accessCode].groups[nowGroupNo].socketID[nowActivityNo] = nowActivitySocketID

            let thisGroup = nowGroupNo //클라이언트에서 동일 모둠인지 확인하기 위해서 현재모둠 정보를 룸에 조인되어 있는 모든 클라이언트에게 정보를 발송한다.
            io.to(accessCode).emit('putSelectActivityName', tasks, thisGroup)
        })

        socket.on('paintStart', function (accessCode, group, activityNumber, activityName, userEmail, userName) {

            if (!tasks2) tasks2 = {}

            if (!tasks2[accessCode]) tasks2[accessCode] = {
                groups: {}
            }

            if (!tasks2[accessCode].groups[group]) {
                tasks2[accessCode].groups[group] = {
                    users: {}, // 각 모둠에 참가하는 사용자 정보 객체
                    activity: [], // 각 모둠 내 세부활동 목록 배열
                    socketID: []
                }
            }

            //바뀌는 소켓 정보를 저장함
            tasks2[accessCode].groups[group].socketID[activityNumber] = socket.id

            tasks2[accessCode].groups[group].users[socket.id] = {
                userName: userName,
                userEmail: userEmail,
                activity: activityName
            }

            tasks2[accessCode].groups[group].activity[activityNumber] = userName

            socketID[socket.id] = {
                userEmail: userEmail,
                accessCode: accessCode,
                nowGroupNo: group,
                nowActivityNo: activityNumber
            }

            io.to(accessCode).emit('canvasSize', canvasSize, (activityTime[accessCode])) //타이머 값 넘기기
            //socket.to(accessCode).broadcast.emit('canvasSize', canvasSize)
        })

        socket.on('nextSession', function (accessCode) {
            io.to(accessCode).emit(`nextSession${accessCode}`) //타이머 값 넘기기            
        })

        socket.on('passCanvas', function (accessCode, group, activityNumber, activityCount, nowCanvas) {
            //모둠 인원이 활동 수보다 적으면 어떻할것인가?
            //모둠내 인원 수를 계산 => 당장 필요하지은 않아서 주석처리함.
            // userCount = 0
            // Object.values(tasks[accessCode].groups[group].users).forEach(user => {
            //     if (user.userName) {
            //         userCount++
            //     }
            // })

            let nextActivity = 0

            if (activityNumber < activityCount) {
                nextActivity = activityNumber * 1 + 1
            } else {
                nextActivity = 1
            }

            let tasksNextActivity 

            findNextActivity()

            function findNextActivity() {
                tasksNextActivity = tasks2[accessCode].groups[group].activity[nextActivity]

                if (tasksNextActivity == undefined) {
                    if (nextActivity < activityCount) {
                        nextActivity++
                    } else {
                        nextActivity = 1
                    }
                    findNextActivity()
                } else {
                    return
                }
            }

            console.log('서버의 passCanvas', activityNumber, nextActivity, nowCanvas)
            console.log('다음 활동의 소켓', nextActivity, tasks2[accessCode].groups[group].socketID[nextActivity])

            io.to(tasks2[accessCode].groups[group].socketID[nextActivity]).emit('passCanvas', nowCanvas)
            // 전체 동일하게 반영함 socket.to(accessCode).broadcast.emit('drawing', canvasJson)
        })

        socket.on('returnCanvas', function (accessCode) {
            io.to(accessCode).emit('returnCanvas')
        })

        socket.on('returnCanvas2', function (accessCode, nowCanvas) {
            io.to(nowCanvas.socketID).emit('returnCanvas2', nowCanvas)
        })

        socket.on('disconnect', function () {
            try {
                if (!socketID || !socketID[socket.id]) return
                if (socketID[socket.id].accessCode) {
                    if (tasks[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].users[socket.id]) {
                        delete tasks[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].users[socket.id]
                        if(tasks[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].activity[socketID[socket.id].nowActivityNo]) {
                            tasks[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].socketID[socketID[socket.id].nowActivityNo] = ""
                            tasks[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].activity[socketID[socket.id].nowActivityNo] = ""
                        }
                        io.to(socketID[socket.id].accessCode).emit('putSelectGroupName', tasks)
                    } else {
                        delete tasks2[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].users[socket.id]
                        if(tasks2[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].activity[socketID[socket.id].nowActivityNo]) {
                            tasks2[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].socketID[socketID[socket.id].nowActivityNo] = ""
                            tasks2[socketID[socket.id].accessCode].groups[socketID[socket.id].nowGroupNo].activity[socketID[socket.id].nowActivityNo] = ""
                        }
                    }                    
                    delete socketID[socket.id]
                    console.log("disconnect 삭제 완료")
                }

            } catch (e) {
                console.error(e)
            }
            
            // getUserRooms(socket).forEach(room => {
            // console.log(rooms[room].users[socket.id] + ' disconnected')
            // socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
            // delete rooms[room].users[socket.id]
            // })
        })
    });

    //     function getUserRooms(socket) {
    //         return Object.entries(rooms).reduce((names, [name, room]) => {
    //             if (room.users[socket.id] != null) names.push(name)
    //             return names
    //         }, [])
    //     }
}