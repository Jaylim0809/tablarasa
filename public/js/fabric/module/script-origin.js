import {
    timer
} from './script-controller.js';

let socket = io();

const gebi = function (id) {
    return document.getElementById(id)
}

//Sockets

if (gebi('c')) {

    socket.emit('new-user', accessCode)

    socket.on('user-connected', tasks => {
        console.log("paintStart 시작합니다.")
        socket.emit('paintStart', accessCode, group, activityNumber, activityName, userEmail, userName)
    });

    socket.on(`canvasSize${accessCode}-${group}-${activityNumber}`, (canvasSizeObject, activityTimeObject) => {

        let canvasSize = canvasSizeObject[accessCode]
        if (canvasSize == 0) {
            gebi('c').width = 640
            gebi('c').height = 480
        } else if (canvasSize == 1) {
            gebi('c').width = 800
            gebi('c').height = 600
        } else if (canvasSize == 2) {
            gebi('c').width = 1024
            gebi('c').height = 768
        } else if (canvasSize == 3) {
            gebi('c').width = 1280
            gebi('c').height = 800
        }
        // 제일 아래에서 닫을 것임 })

        const canvas = this.__canvas = new fabric.Canvas('c', {
            isDrawingMode: false
        })

        let isLoadedFromJson = false;

        let w = canvas.width;
        let h = canvas.height;

        console.log("canvas.width, canvas.height", canvas.width, canvas.height)

        const lineColorEl = gebi('line-color');
        const lineWidthEl = gebi('line-width');

        fabric.Object.prototype.transparentCorners = false;

        gebi('remove').onclick = function () {
            canvas.remove(canvas.getActiveObject());
        }

        gebi('select').onclick = function () {
            canvas.isDrawingMode = false;
            canvas.selectionColdddor = 'rgba(0,255,0,0.3)';
            canvas.selectionBorderColor = 'red';
            canvas.selectionLineWidth = 5;
            this.__canvases.push(canvas);
        }

        gebi('pencil').onclick = function () {
            canvas.isDrawingMode = true;
            console.log("연필의 drawingmode는?", canvas.isDrawingMode)
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = lineColorEl.value;
            canvas.freeDrawingBrush.width = parseInt(lineWidthEl.value, 10) || 1;
        }

        gebi('text').onclick = function () {
            canvas.isDrawingMode = false;
            var textbox = new fabric.Textbox('', {
                left: 20,
                top: 50,
                width: 150,
                backgroundColor: 'rgba(0,255,0,0.3)',
                fill: '#000000',
            })
            canvas.add(textbox);
        }

        gebi('clear').onclick = function () {
            canvas.clear();
        }

        // gebi('leave').onclick = function () {
        //     let aux = canvas;
        //     let json = aux.toJSON();
        //     let data = {
        //         w: w,
        //         h: h,
        //         data: json
        //     };
        //     let dataString = JSON.stringify(data);
        //     console.log(data, gebi('boardDataSumit'))
        //     gebi('boardDataInput').value = dataString;
        //     gebi('boardDataSubmit').submit();
        // }

        gebi('line-color').onchange = function () {
            canvas.freeDrawingBrush.color = this.value;
        }

        gebi('line-width').onchange = function () {
            canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
            this.previousSibling.innerHTML = this.value;
        }

        //emitEvent(); //다른 사용자에게 그림 정보 전송하는 함수임!
        function emitEvent() {
            let aux = canvas;
            let json = aux.toJSON();
            let data = {
                w: w,
                h: h,
                data: json
            };
            socket.emit('drawing', accessCode, data);
            console.log('drawing emitted')
        }

        // canvas.on('after:render', () => {
        //     if (!isLoadedFromJson) {
        //         console.log('emitEvent executed')
        //     }
        //     isLoadedFromJson = false;
        //     console.log(canvas.toJSON());
        // });

        socket.on('drawing', obj => {
            //set this flag, to disable infinite rendering loop
            isLoadedFromJson = true;

            //calculate ratio by dividing this canvas width to sender canvas width
            let ratio = w / obj.w;

            //reposition and rescale each sent canvas object
            obj.data.objects.forEach(object => {
                object.left *= ratio;
                object.scaleX *= ratio;
                object.top *= ratio;
                object.scaleY *= ratio;
            });

            canvas.loadFromJSON(obj.data);
            console.log('canvas loadfromJSON');
        });

        // 타이머를 위한 코드 

        timer(activityTimeObject)

        // 타이머를 위한 코드 끝


    }) // socket.on('canvasSize'가 여기서 닫힘.

} // canvas 있으면 실행하는 함수 끝 
else if (gebi('start-form')) {

    /////////////////////////////////////////////////////
    //라우터에서 task, userEmail, userName, activityCount값을 전송받음.//
    /////////////////////////////////////////////////////

    let nowGroupNo = 0 // 선택한 모둠을 저장하기 위한 변수
    let nowActivityNo = 0 // 선택한 활동을 저장하기 위한 변수
    let activityUser

    socket.emit('new-user', accessCode)
    //accessCode를 서버의 socket.js에 넘겨줌.

    socket.on('user-connected', () => {

    });

    socket.on('user-disconnected', data => {
        //document.boardDataSumit.submit();
    })

    const selectGroup = (clickedGroupNo) => {
        // 모둠 선택을 위한 라디오 버튼 누를 때 실행하는 onclick event
        console.log("!!!!선택한 모둠!!!!", clickedGroupNo)

        //서버에서 tasks를 가져온다
        socket.emit('groupRequestTasks', clickedGroupNo)
        socket.on(`groupGetTasks${clickedGroupNo}`, tasks => {

            console.log("클릭한 모둠 번호:", clickedGroupNo)

            //이전에 선택한 모둠과 지금 선택한 모둠 같으면 중단
            //if (nowGroupNo == clickedGroupNo) return
            //nowGroupNo은 이전에 선택한 모둠 번호, clickedGroupNo는 지금 선택한 모둠 번호
            socket.emit('setGroup', accessCode, nowGroupNo, clickedGroupNo, userEmail, userName, nowActivityNo)
            nowGroupNo = clickedGroupNo
            nowActivityNo = 0 //모둠이 바뀌면 세부활동도 초기화 해줘야 함.

            //각 세부 활동에 표시된 이름 정보를 삭제한다.
            for (let j = 1; j < (activityCount + 1); j++) {
                if (gebi(`select-activity-name-${j}`))
                    gebi(`select-activity-name-${j}`).innerText = ""
            }
        })
    }

    socket.on('putSelectGroupName', tasks => {

        console.log("groupCount에 저장된 모둠 수는?", groupCount)
        //groupCount는 5인데, 순환문이 50번 반복되는 이유는 무엇일까? 미스테리하다!!!

        for (let i = 1; i < (groupCount + 1); i++) {
            console.log("모둠 찍는 일이 반복되는 횟수는?", i)
            if (!tasks[accessCode].groups[i] && gebi(`select-group-name-${i}`)) {
                gebi(`select-group-name-${i}`).innerText = ""
            } else if (!tasks[accessCode].groups[i]) {

                return //groupCount는 5인데, 순환문이 50번 반복되는 이유는 무엇일까? 미스테리하다!!!

            } else if (tasks[accessCode].groups[i]) {
                let userNames = []
                console.log(i, "모둠의 사용자는?", Object.values(tasks[accessCode].groups[i].users))
                Object.values(tasks[accessCode].groups[i].users).forEach(user => {
                    if (user.userName) {
                        console.log("userName 있으면 표시:", user.userName)
                        userNames.push(user.userName)
                    }
                })
                console.log(i, userNames, "을 화면에 찍겠습니다.")
                if (gebi(`select-group-name-${i}`).innerText != userNames.toString())
                    gebi(`select-group-name-${i}`).innerText = userNames.toString()
            }
        }
    })

    const selectActivity = function (clickedActivityNo) {
        // 활동 선택을 위한 라디오 버튼 누를 때 실행하는 onclick event

        console.log("!!!세부활동 선택 시작!!! 선택하신 번호는?", clickedActivityNo)

        //이전에 선택한 모둠과 지금 선택한 모둠 같으면 중단
        if (nowActivityNo == clickedActivityNo) return

        //모둠을 선택했을 때만 실행함.
        if (nowGroupNo == 0) {
            return alert("모둠을 선택한 후 활동을 선택할 수 있습니다.")
        }

        //서버에서 tasks를 가져온다
        socket.emit('activityRequestTasks', clickedActivityNo)
        socket.on(`activityGetTasks${clickedActivityNo}`, tasks => {

            //활동을 사전에 선택한 사람이 있다면 중단
            activityUser = tasks[accessCode].groups[nowGroupNo].activity[clickedActivityNo]
            if (!activityUser) {
                socket.emit('setActivity', accessCode, nowGroupNo, nowActivityNo, userName, clickedActivityNo, activityDetail)
                return nowActivityNo = clickedActivityNo
            } else {
                console.log("이미 선택한 활동입니다.")
                console.log("이미 선택된 활동의 번호는", clickedActivityNo, tasks[accessCode].groups[nowGroupNo].activity[clickedActivityNo])
                return alert('이미 선택된 활동입니다.')
            }
        })
    }

    socket.on('putSelectActivityName', (tasks, thisGroup) => {
        if (nowGroupNo != thisGroup) return

        console.log("세부활동의 수 activityCount는?", activityCount)
        for (let j = 1; j < (activityCount + 1); j++) {
            let displayName
            let displayNameDiv = gebi(`select-activity-name-${j}`)
            if (!gebi(`select-activity-name-${j}`)) break
            activityUser = tasks[accessCode].groups[nowGroupNo].activity[j]
            if (!activityUser) {
                displayName = ""
            } else {
                displayName = activityUser
            }
            console.log(j, "세부활동에 찍을 이름", displayNameDiv)
            if (displayNameDiv) displayNameDiv.innerText = displayName
        }
    })

    //교사가 시작하면 학생 start 페이지의 form이 submit 되면서 활동으로 넘어가짐
    socket.on(`teacherStart${accessCode}`, () => {
        console.log('teacherStart! 자동submit됩니다.')
        console.log("!gebi('student-start-button')", !gebi('student-start-button'))
        console.log("!gebi('start-form')", !gebi('start-form'))
        if (gebi('start-form')) gebi('start-form').submit()
    })

} // 학생용 함수 끝, 교사용 함수 시작
else if (gebi('teacher-form')) {

    /////////////////////////////////////////////////////
    //라우터에서 accessCode, groupCount, userEmail, userName, activityCount값을 전송받음.//
    /////////////////////////////////////////////////////

    console.log('교사용 script.js가 시작함.')

    let activityUser
    let displayName
    let nowTasks = {}

    socket.emit('new-user', accessCode)
    //accessCode를 서버의 socket.js에 넘겨줌.

    socket.on('user-connected', () => {
        //tasks를 넘겨 받아서
        //a href 태그를 교사 페이지에 학생 수 만큼 붙여넣어야 함.
        //학생 목록이 동일하면 굳이 변경할 필요는 없을 것임.
        console.log('사용자가 접속함')
        console.log("!gebi('teacher-start-button')", !gebi('teacher-start-button'))
        gebi('teacher-start-button').addEventListener('click', e => {
            console.log('onclick 이벤트 발생하나?')
            console.log('accessCode', accessCode)
            clearInterval(nameInterval)
            socket.emit('teacherStart', accessCode, gebi('canvas-size').selectedIndex, gebi('activity-time').selectedIndex) //타이머 추가
        })

        const nameInterval = setInterval(socketPutActivityNames, 3000)

    })

    socket.on('user-disconnected', data => {
        document.boardDataSumit.submit();
    })

    const socketPutActivityNames = function () {
        socket.emit('teacherRequestTasks', userEmail)
        socket.on(`teacherGetTasks${userEmail}`, tasks => {
            putActivityNames(tasks)
        })
    }

    const putActivityNames = function (tasks) {
        console.log('교사 모니터링 페이지의 setInterval 시작')
        console.log("nowTasks!=tasks[accessCode]", nowTasks != tasks[accessCode])

        if (nowTasks === tasks[accessCode]) return
        nowTasks = tasks[accessCode]
        console.log("모둠의 수는? groupCount", groupCount)
        console.log("tasks[accessCode] 출력하기", tasks[accessCode])
        let totalUsers = 0
        for (let i = 0; i < groupCount; i++) {
            for (let j = 0; j < activityCount; j++) {
                let displayNameDiv = gebi(`${i + 1}-${j + 1}`)
                if (!gebi(`${i + 1}-${j + 1}`) || !tasks[accessCode].groups[i + 1]) break
                if (!tasks[accessCode].groups[i + 1].activity) continue
                if (!tasks[accessCode].groups[i + 1].activity[j + 1]) {
                    activityUser = ""
                } else {
                    activityUser = tasks[accessCode].groups[i + 1].activity[j + 1]
                }
                if (!activityUser) {
                    displayName = ""
                } else {
                    displayName = activityUser
                    totalUsers++
                }
                console.log(j + 1, "세부활동에 찍을 이름", displayNameDiv)
                if (displayNameDiv) displayNameDiv.innerText = displayName
            }
        }
        gebi('total-users').innerText = totalUsers
    }

    // 타이머를 위한 코드 


    socket.on('canvasSize', (canvasSizeObject, activityTimeObject) => {

        timer(activityTimeObject)
    })
    // 타이머를 위한 코드 끝
}