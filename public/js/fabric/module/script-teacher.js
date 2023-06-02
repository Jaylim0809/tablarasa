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

export {
    selectGroup, 
}