let socket = io();

const gebi = function (id) {
    return document.getElementById(id)
}

let tid
let remainTime
let timerRepeat = 0
let activityTime
let m
let miniutes
let seconds

function timer(activityT) {

    activityTime = activityT + 1
    // 인덱스는 0부터 시작, 시간은 1분부터 시작, 1을 더해야 한다.

    if (!gebi('teacher-form')) {
        remainTime = activityTime * 60000
    } else {
        remainTime = activityTime * 60000 + 3000
    }

    tid = setInterval(msgTime, 1000)
}

function msgTime() {
    miniutes = Math.floor((remainTime % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((remainTime % (1000 * 60)) / 1000)

    m = miniutes + "분 " + seconds + "초";

    document.all.activityTimer.innerHTML = m;

    if (remainTime <= 0) {
        clearInterval(tid);
        if (gebi('teacher-form')) {
            if ((timerRepeat++) == (1 + gebi('round-count').selectedIndex)) {
                socket.emit('returnCanvas', accessCode)
            } else {
                console.log('타이머 반복횟수, 활동수', timerRepeat, activityCount)
                socket.emit('nextSession', accessCode)
                // 교사만 보낼 수 있도록 해야 함
                activityTime = activityTime - 1
                timer(activityTime)
                console.log('타이머재시작')
            }
        }
    } else {
        remainTime = remainTime - 1000;
    }
}

import {
    zoomIn,
    zoomOut,
    resetZoom
} from "./module/zoom.js"

//Sockets

if (gebi('c')) {

    // OPEN ai 질문하기 

    const openApiURL = 'http://aiopen.etri.re.kr:8000/WikiQA';
    const access_key = 'babfdbb5-1fe8-4dd2-8cba-b4d413bdc739';
    const type = 'hybridqa'
    let question;
    let requestJson;

    gebi('answer-btn').addEventListener('click', e => {

        question = gebi('question').value;

        requestJson = {
            'access_key': access_key,
            'argument': {
                'question': question,
                'type': type
            }
        };

        axios({
                method: 'post',
                url: openApiURL,
                data: JSON.stringify(requestJson),
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }).then(function (res) {
                console.log(res);
                gebi('answer').innerText = "[AI응답] " + res.data.return_object.WiKiInfo.AnswerInfo[0].answer;
            })
            .catch(function (err) {
                gebi('answer').innerText = "AI가 위키에서 질문의 내용을 찾지 못했습니다."
                console.log(err);
            })

    });

    detailImage()

    let hasStarted = 0
    let nowCanvas = {
        socketID: null,
        activityNumber: activityNumber,
        activityName: activityName,
        w: null,
        h: null,
        data: null
    };

    let hasEmitted = 0

    socket.emit('new-user', accessCode)

    socket.on('user-connected', function () {
        console.log("paintStart 시작합니다.")
        socket.emit('paintStart', accessCode, group, activityNumber, activityName, userEmail, userName)
    });

    function detailImage() {
        if (path) {
            gebi("detail-image").innerHTML =
                `<img src="../../../uploads/${path.split('/',3)[2]}" width="90%">`
        }
    }

    socket.on('canvasSize', function (canvasSizeObject, activityTimeObject) {
        if (hasStarted) return
        hasStarted = 1
        let canvasSize = canvasSizeObject[accessCode]
        if (canvasSize == 0 || !canvasSize) {
            gebi('c').width = 640
            gebi('c').height = 320
        } else if (canvasSize == 1) {
            gebi('c').width = 800
            gebi('c').height = 400
        } else if (canvasSize == 2) {
            gebi('c').width = 1024
            gebi('c').height = 512
        } else if (canvasSize == 3) {
            gebi('c').width = 1280
            gebi('c').height = 640
        }
        // 제일 아래에서 닫을 것임 })

        const canvas = this.__canvas = new fabric.Canvas('c', {
            isDrawingMode: false
        })

        let isLoadedFromJson = false;

        let w = canvas.width;
        let h = canvas.height;

        //타이머 작동 시작
        timer(activityTimeObject)

        const lineColorEl = gebi('line-color');
        const lineWidthEl = gebi('line-width');

        fabric.Object.prototype.transparentCorners = false;

        gebi('remove').onclick = function () {
            canvas.isDrawingMode = false;
            var doomedObj = canvas.getActiveObject();
            if (doomedObj) {
                if (doomedObj.type === 'activeSelection') {
                    // active selection needs a reference to the canvas.
                    doomedObj.canvas = canvas;
                    doomedObj.forEachObject(function (obj) {
                        canvas.remove(obj);
                    });
                } //endif multiple objects
                else {
                    //If single object, then delete it
                    var activeObject = canvas.getActiveObject();
                    //How to delete multiple objects?
                    //if(activeObject !== null && activeObject.type === 'rectangle') {
                    if (activeObject !== null) {
                        canvas.remove(activeObject);
                    }
                } //end else there's a single object
            } else {
                alert("삭제할 객체를 선택해주세요.");
                gebi('select').click;
            }
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

        // button Zoom In
        gebi("btnZoomIn").onclick = function () {
            zoomIn(canvas);
            console.log(canvas.height, canvas.width)
        }
        // button Zoom Out
        gebi("btnZoomOut").onclick = function () {
            zoomOut(canvas);
            console.log(canvas.height, canvas.width)
        }
        // button Reset Zoom
        gebi("btnResetZoom").onclick = function () {
            resetZoom(canvas);
            console.log(canvas.height, canvas.width)
        }

        // createListenersKeyboard(canvas);

        gebi("btnUndo").onclick = function () {
            canvas.undo()
        }

        gebi("btnRedo").onclick = function () {
            canvas.redo()
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
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = lineColorEl.value;
            canvas.freeDrawingBrush.width = parseInt(lineWidthEl.value, 10) || 1;
        }

        gebi('line-width').onchange = function () {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = lineColorEl.value;
            canvas.freeDrawingBrush.width = parseInt(lineWidthEl.value, 10) || 1;
            this.previousSibling.innerHTML = this.value;
        }

        //emitEvent(); //다른 사용자에게 그림 정보 전송하는 함수임!
        function emitEvent() {
            let aux = canvas;
            let json = aux.toJSON();

            if (!nowCanvas.socketID) {
                nowCanvas.socketID = socket.id
                nowCanvas.activityNumber = activityNumber
                nowCanvas.activityName = activityName
                nowCanvas.w = w
                nowCanvas.h = h
                nowCanvas.data = json
            } else {
                nowCanvas.data = json
            }

            socket.emit('passCanvas', accessCode, group, activityNumber, activityCount, nowCanvas);
        }

        //image 붙이기 (copy and paste)

        // imgAttrs = {
        //     left: 200,
        //     top: 200,
        //     originY: 'center',
        //     originX: 'center',
        //     borderColor: '#d6d6d6',
        //     cornerColor: '#d6d6d6',
        //     cornerSize: 5,
        //     cornerStyle: 'circle',
        //     transparentCorners: false,
        //     lockUniScaling: true
        //   }

        function pasteImage(e) {
            var items = e.originalEvent.clipboardData.items;

            e.preventDefault();
            e.stopPropagation();

            //Loop through files
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') == -1) continue;
                var file = items[i],
                    type = items[i].type;
                var imageData = file.getAsFile();
                var URLobj = window.URL || window.webkitURL;
                var img = new Image();
                img.src = URLobj.createObjectURL(imageData);
                fabric.Image.fromURL(img.src, function (img) {
                    canvas.add(img);
                });
            }
        }

        $(window).on('paste', pasteImage);

        // canvas.on({
        //     'touch:longpress': function () {
        //         var text = document.createTextNode(' Longpress ');
        //         info.insertBefore(text, info.firstChild);
        //     }
        // });

        // canvas.on({
        //     'touch:gesture': function (e) {
        //         if (e.e.touches && e.e.touches.length == 2) {
        //             pausePanning = true;
        //             var point = new fabric.Point(e.self.x, e.self.y);
        //             if (e.self.state == "start") {
        //                 zoomStartScale = self.canvas.getZoom();
        //             }
        //             var delta = zoomStartScale * e.self.scale;
        //             self.canvas.zoomToPoint(point, delta);
        //             pausePanning = false;
        //         }
        //     },
        //     'object:selected': function () {
        //         pausePanning = true;
        //     },
        //     'selection:cleared': function () {
        //         pausePanning = false;
        //     },
        //     'touch:drag': function (e) {
        //         if (pausePanning == false && undefined != e.e.layerX && undefined != e.e.layerY) {
        //             currentX = e.e.layerX;
        //             currentY = e.e.layerY;
        //             xChange = currentX - lastX;
        //             yChange = currentY - lastY;

        //             if ((Math.abs(currentX - lastX) <= 50) && (Math.abs(currentY - lastY) <= 50)) {
        //                 var delta = new fabric.Point(xChange, yChange);
        //                 canvas.relativePan(delta);
        //             }

        //             lastX = e.e.layerX;
        //             lastY = e.e.layerY;
        //         }
        //     }
        // });

        // canvas.on('after:render', () => {
        //     if (!isLoadedFromJson) {
        //         console.log('emitEvent executed')
        //     }
        //     isLoadedFromJson = false;
        //     console.log(canvas.toJSON());
        // });

        // 타이머를 위한 코드 끝

        socket.on(`nextSession${accessCode}`, function () {
            if (hasEmitted) {
                return
            } else {
                emitEvent()
                hasEmitted = 1
            }
        })

        socket.on('passCanvas', function (canvasData) {


            //활동번호와 활동명을 받아서 화면에 표시해줘야 한다.
            nowCanvas = canvasData
            renderCanvas(nowCanvas)
            activityTime = activityTime - 1
            timer(activityTime)
        });

        function renderCanvas(obj) {
            if (!hasEmitted) return renderCanvas(obj)
            hasEmitted = 0
            //calculate ratio by dividing this canvas width to sender canvas width
            let ratio = w / obj.w;

            //reposition and rescale each sent canvas object
            obj.data.objects.forEach(object => {
                object.left *= ratio;
                object.scaleX *= ratio;
                object.top *= ratio;
                object.scaleY *= ratio;
            });

            gebi('activityNumber').innerText = obj.activityNumber
            gebi('activityName').innerText = obj.activityName

            canvas.loadFromJSON(obj.data);
            //set this flag, to disable infinite rendering loop
            isLoadedFromJson = true;

            if (readyToSave) {
                axios({
                    method: 'post',
                    url: '../save',
                    data: {
                        email: userEmail,
                        boardData: obj,
                        activityName: activityName
                    }
                });
            }
        }

        socket.on('returnCanvas', function (accessCode) {
            let aux = canvas;
            let json = aux.toJSON();

            nowCanvas.w = w
            nowCanvas.h = h
            nowCanvas.data = json

            socket.emit('returnCanvas2', accessCode, nowCanvas);

            hasEmitted = 1 //캔버스 정보를 보낸 후에만 받을 수 있도록 확인하는 flag
        })

        let readyToSave = 0

        socket.on('returnCanvas2', function (nowCanvas) {
            readyToSave = 1
            renderCanvas(nowCanvas)
        })

        socket.on('teacherStop', function () {
            gebi('returnToHome').click()
        })

    }) // socket.on('canvasSize'가 여기서 닫힘.

} // canvas 있으면 실행하는 함수 끝
else if (gebi('student-form')) {

    /////////////////////////////////////////////////////
    //라우터에서 task, userEmail, userName, activityCount값을 전송받음.//
    /////////////////////////////////////////////////////

    let nowGroupNo = 0 // 선택한 모둠을 저장하기 위한 변수
    let nowActivityNo = 0 // 선택한 활동을 저장하기 위한 변수
    let activityUser

    socket.emit('new-user', accessCode)
    //accessCode를 서버의 socket.js에 넘겨줌.

    socket.on('user-connected', function () {

    });

    socket.on('user-disconnected', function (data) {
        //document.boardDataSumit.submit();
    })

    // const clickEvent = (function () {
    //     if ('ontouchstart' in document.documentElement === true) return 'touchstart';
    //     else return 'click';
    // })();

    for (let k = 1; k <= groupCount; k++) {
        gebi(`select-group-${k}`).addEventListener('click', function (e) {
            // 모둠 선택을 위한 라디오 버튼 누를 때 실행하는 onclick event

            //서버에서 tasks를 가져온다
            socket.emit('groupRequestTasks', k)
            socket.on(`groupGetTasks${k}`, function (tasks) {

                //이전에 선택한 모둠과 지금 선택한 모둠 같으면 중단
                //if (nowGroupNo == clickedGroupNo) return
                //nowGroupNo은 이전에 선택한 모둠 번호, clickedGroupNo는 지금 선택한 모둠 번호
                socket.emit('setGroup', accessCode, nowGroupNo, k, userEmail, userName, nowActivityNo)
                nowGroupNo = k
                nowActivityNo = 0 //모둠이 바뀌면 세부활동도 초기화 해줘야 함.

                //각 세부 활동에 표시된 이름 정보를 삭제한다.
                for (let l = 1; l <= activityCount; l++) {
                    if (gebi(`select-activity-name-${l}`))
                        gebi(`select-activity-name-${l}`).innerText = ""
                        gebi(`select-activity-${l}`).checked = false
                }

                putActivityNameCallback(tasks, k)
                //모둠 선택하면 기존의 활동 정보 지우고 새로운 활동 정보를 표시해준다.

            })
        })
    }

    socket.on('putSelectGroupName', function (tasks) {

        console.log("groupCount에 저장된 모둠 수는?", groupCount)
        //groupCount는 5인데, 순환문이 50번 반복되는 이유는 무엇일까? 미스테리하다!!!

        for (let m = 1; m <= groupCount; m++) {
            console.log("모둠 찍는 일이 반복되는 횟수는?", m)
            if (!tasks[accessCode].groups[m] && gebi(`select-group-name-${m}`)) {
                gebi(`select-group-name-${m}`).innerText = ""
            } else if (!tasks[accessCode].groups[m]) {

                return //groupCount는 5인데, 순환문이 50번 반복되는 이유는 무엇일까? 미스테리하다!!!

            } else if (tasks[accessCode].groups[m]) {
                let userNames = []
                console.log(m, "모둠의 사용자는?", Object.values(tasks[accessCode].groups[m].users))
                Object.values(tasks[accessCode].groups[m].users).forEach(user => {
                    if (user.userName) {
                        userNames.push(user.userName)
                    }
                })
                if (gebi(`select-group-name-${m}`).innerText != userNames.toString())
                    gebi(`select-group-name-${m}`).innerText = userNames.toString()
            }
        }
    })

    for (let n = 1; n <= activityCount; n++) {
        gebi(`select-activity-${n}`).addEventListener('click', function (e) {
            // 활동 선택을 위한 라디오 버튼 누를 때 실행하는 onclick event

            //이전에 선택한 모둠과 지금 선택한 모둠 같으면 중단
            if (nowActivityNo == n) return

            //모둠을 선택했을 때만 실행함.
            if (nowGroupNo == 0) {
                return alert("모둠을 선택한 후 활동을 선택할 수 있습니다.")
            }

            //서버에서 tasks를 가져온다
            socket.emit('activityRequestTasks', n)
            socket.on(`activityGetTasks${n}`, function (tasks) {
                try {
                    activityUser = tasks[accessCode].groups[nowGroupNo].activity[n]
                    //활동을 사전에 선택한 사람이 있다면 중단
                    if (!activityUser) {
                        socket.emit('setActivity', accessCode, nowGroupNo, nowActivityNo, userName, n, activityDetail)
                        return nowActivityNo = n
                    } else {
                        return alert('이미 선택된 활동입니다.')
                    }
                } catch (e) {
                    console.log(e)
                }
            })
        })
    }

    socket.on('putSelectActivityName', function (tasks, thisGroup) {
        putActivityNameCallback(tasks, thisGroup)
    })

    const putActivityNameCallback = function (tasks, thisGroup) {
        if (nowGroupNo != thisGroup) return

        console.log("세부활동의 수 activityCount는?", activityCount)
        for (let o = 1; o <= activityCount; o++) {
            let displayName
            let displayNameDiv = gebi(`select-activity-name-${o}`)
            if (!gebi(`select-activity-name-${o}`)) break
            activityUser = tasks[accessCode].groups[nowGroupNo].activity[o]
            if (!activityUser) {
                displayName = ""
            } else {
                displayName = activityUser
            }
            if (displayNameDiv) displayNameDiv.innerText = displayName
        }
    }


    //교사가 시작하면 학생 start 페이지의 form이 submit 되면서 활동으로 넘어가짐
    socket.on('teacherStart', function () {
        if (gebi('student-form')) gebi('student-form').submit()
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

    socket.on('user-connected', function () {
        //tasks를 넘겨 받아서
        //a href 태그를 교사 페이지에 학생 수 만큼 붙여넣어야 함.
        //학생 목록이 동일하면 굳이 변경할 필요는 없을 것임.
        console.log('사용자가 접속함')
        console.log("!gebi('teacher-start-button')", !gebi('teacher-start-button'))
        gebi('teacher-start-button').addEventListener('click', function (e) {
            console.log('onclick 이벤트 발생하나?')
            console.log('accessCode', accessCode)
            clearInterval(nameInterval)
            let assignedCanvasSize = gebi('canvas-size').selectedIndex
            let assignedActivityTime = gebi('activity-time').selectedIndex
            socket.emit('teacherStart', accessCode, assignedCanvasSize, assignedActivityTime) //타이머 추가

            timer(assignedActivityTime)
        })

        // gebi('teacher-stop-button').style.display = "none"
        gebi('teacher-stop-button').addEventListener('click', function (e) {
            socket.emit('teacherStop', accessCode)
            gebi('returnToHome').click()
        })

        const nameInterval = setInterval(socketPutActivityNames, 3000)

    })

    socket.on('user-disconnected', function (data) {
        document.boardDataSumit.submit();
    })

    const socketPutActivityNames = function () {
        socket.emit('teacherRequestTasks', socket.id)
        socket.on('teacherGetTasks', function (tasks) {
            putActivityNames(tasks)
        })
    }

    const putActivityNames = function (tasks) {
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
}