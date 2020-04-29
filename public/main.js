'use strict';

(function() {

    var socket = io();
    
    let body = document.body;
    let cards = [
        document.querySelector('#card_0'),
        document.querySelector('#card_1')
    ];
    let movingCard = {
        id: null,
        x: null,
        y: null
    };
    let offsetX = null;
    let offsetY = null;

    body.addEventListener('mousedown', function(e) {
        if (!movingCard.id) {
            e.preventDefault();
            //console.log(e);
            movingCard.id = e.target.id.slice(5);
            offsetX = e.offsetX;
            offsetY = e.offsetY;
        }
    }, false);
    
    body.addEventListener('mousemove', throttle(function(e) {
        if (movingCard.id) {
            e.preventDefault();
            //console.log(e);
            movingCard.x = e.clientX - offsetX;
            movingCard.y = e.clientY - offsetY;
            cards[movingCard.id].style.left = movingCard.x + 'px';
            cards[movingCard.id].style.top = movingCard.y + 'px';

            socket.emit('moving', movingCard);
        }
    }, 10), false);

    body.addEventListener('mouseup', throttle(function(e) {
        if (movingCard.id) {
            e.preventDefault();
            //console.log(e);
            movingCard.id = null;
            movingCard.x = null;
            movingCard.y = null;
            offsetX = null;
            offsetY = null;

            socket.emit('moving', movingCard);
        }
    }, 10), false);

    socket.on('moving', function(data) {
        movingCard.id = data.id;
        if (data.id) {
            cards[data.id].style.left = data.x;
            cards[data.id].style.top = data.y;
        }
    });

    // limit the number of events per second
    function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function() {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    var canvas = document.getElementsByClassName('whiteboard')[0];
    var colors = document.getElementsByClassName('color');
    var context = canvas.getContext('2d');

    var current = {
        color: 'black'
    };
    var drawing = false;

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
    
    //Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    for (var i = 0; i < colors.length; i++){
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    socket.on('drawing', onDrawingEvent);

    window.addEventListener('resize', onResize, false);
    onResize();


    function drawLine(x0, y0, x1, y1, color, emit){
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        if (!emit) { return; }
        var w = canvas.width;
        var h = canvas.height;

        socket.emit('drawing', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color
        });
    }

    function onMouseDown(e){
        drawing = true;
        current.x = e.clientX||e.touches[0].clientX;
        current.y = e.clientY||e.touches[0].clientY;
    }

    function onMouseUp(e){
        if (!drawing) { return; }
        drawing = false;
        drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
    }

    function onMouseMove(e){
        if (!drawing) { return; }
        drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
        current.x = e.clientX||e.touches[0].clientX;
        current.y = e.clientY||e.touches[0].clientY;
    }

    function onColorUpdate(e){
        current.color = e.target.className.split(' ')[1];
    }

    function onDrawingEvent(data){
        var w = canvas.width;
        var h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }

    // make the canvas fill its parent
    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

})();