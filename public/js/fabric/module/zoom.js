var canvasScale = 1;
var SCALE_FACTOR = 1.1;

// function createListenersKeyboard(canvas) {
//     document.onkeydown = onKeyDownHandler();
//     //document.onkeyup = onKeyUpHandler;

//     function onKeyDownHandler(event) {
//         //event.preventDefault();

//         var key;
//         if (window.event) {
//             key = window.event.keyCode;
//         } else {
//             key = event.keyCode;
//         }

//         switch (key) {
//             //////////////
//             // Shortcuts
//             //////////////
//             // Zoom In (alt+"+")
//             case 187: // alt+"+"
//                 if (ableToShortcut()) {
//                     if (event.altKey) {
//                         event.preventDefault();
//                         zoomIn(canvas);
//                     }
//                 }
//                 break;
//                 // Zoom Out (alt+"-")
//             case 189: // alt+"-"
//                 if (ableToShortcut()) {
//                     if (event.altKey) {
//                         event.preventDefault();
//                         zoomOut(canvas);
//                     }
//                 }
//                 break;
//                 // Reset Zoom (alt+"0")
//             case 48: // alt+"0"
//                 if (ableToShortcut()) {
//                     if (event.altKey) {
//                         event.preventDefault();
//                         resetZoom(canvas);
//                     }
//                 }
//                 break;
//             default:
//                 // TODO
//                 break;
//         }
//     }

// }

// function ableToShortcut() {
//     /*
//     TODO check all cases for this
    
//     if($("textarea").is(":focus")){
//         return false;
//     }
//     if($(":text").is(":focus")){
//         return false;
//     }
//     */
//     return true;
// }

// Zoom In
function zoomIn(canvas) {
    // TODO limit the max canvas zoom in

    canvasScale = canvasScale * SCALE_FACTOR;

    canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
    canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);

    var objects = canvas.getObjects();
    for (var i in objects) {
        var scaleX = objects[i].scaleX;
        var scaleY = objects[i].scaleY;
        var left = objects[i].left;
        var top = objects[i].top;

        var tempScaleX = scaleX * SCALE_FACTOR;
        var tempScaleY = scaleY * SCALE_FACTOR;
        var tempLeft = left * SCALE_FACTOR;
        var tempTop = top * SCALE_FACTOR;

        objects[i].scaleX = tempScaleX;
        objects[i].scaleY = tempScaleY;
        objects[i].left = tempLeft;
        objects[i].top = tempTop;

        objects[i].setCoords();
    }

    canvas.renderAll();
}

// Zoom Out
function zoomOut(canvas) {
    // TODO limit max cavas zoom out

    canvasScale = canvasScale / SCALE_FACTOR;

    canvas.setHeight(canvas.getHeight() * (1 / SCALE_FACTOR));
    canvas.setWidth(canvas.getWidth() * (1 / SCALE_FACTOR));

    var objects = canvas.getObjects();
    for (var i in objects) {
        var scaleX = objects[i].scaleX;
        var scaleY = objects[i].scaleY;
        var left = objects[i].left;
        var top = objects[i].top;

        var tempScaleX = scaleX * (1 / SCALE_FACTOR);
        var tempScaleY = scaleY * (1 / SCALE_FACTOR);
        var tempLeft = left * (1 / SCALE_FACTOR);
        var tempTop = top * (1 / SCALE_FACTOR);

        objects[i].scaleX = tempScaleX;
        objects[i].scaleY = tempScaleY;
        objects[i].left = tempLeft;
        objects[i].top = tempTop;

        objects[i].setCoords();
    }

    canvas.renderAll();
}

// Reset Zoom
function resetZoom(canvas) {

    canvas.setHeight(canvas.getHeight() * (1 / canvasScale));
    canvas.setWidth(canvas.getWidth() * (1 / canvasScale));

    var objects = canvas.getObjects();
    for (var i in objects) {
        var scaleX = objects[i].scaleX;
        var scaleY = objects[i].scaleY;
        var left = objects[i].left;
        var top = objects[i].top;

        var tempScaleX = scaleX * (1 / canvasScale);
        var tempScaleY = scaleY * (1 / canvasScale);
        var tempLeft = left * (1 / canvasScale);
        var tempTop = top * (1 / canvasScale);

        objects[i].scaleX = tempScaleX;
        objects[i].scaleY = tempScaleY;
        objects[i].left = tempLeft;
        objects[i].top = tempTop;

        objects[i].setCoords();
    }

    canvas.renderAll();

    canvasScale = 1;
}

export {
    zoomIn,
    zoomOut,
    resetZoom
}