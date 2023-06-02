const timer = function (activityTimeObject) {
    let activityTime = activityTimeObject[accessCode] + 3;

    console.log("타이머 찍히나?")

    let tid;
    let RemainDate = activityTime * 60000;

    tid = setInterval(msgTime, 1000);
}

const msgTime = function () {
    console.log("msg_time 함수 호출되나?")
    let miniutes = Math.floor((RemainDate % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((RemainDate % (1000 * 60)) / 1000);

    m = miniutes + ":" + seconds;

    document.all.activityTimer.innerHTML = m;

    if (RemainDate < 0) {
        clearInterval(tid);
    } else {
        RemainDate = RemainDate - 1000;
    }
}

export {
    timer
}