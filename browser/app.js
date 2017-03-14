var socket = io(window.location.origin);
var queue = [];

socket.on('connect', function () {
    //console.log('I have made a persistent two-way connection to the server!');
});

socket.on('paiting', function (data) {
    //console.log('I am getting broadcasted data',data);
    queue.push(data);
    paint();
});

socket.on('reset', function (data) {
    console.log('reset',data); 
   
    whiteboard.reset();
});



function paint(){
  while(queue.length){
     var item = queue.shift();
     whiteboard.draw(item.start, item.end, item.color)
  }
}



window.whiteboard.on('draw', function(start, end, color){
    // Emitting the event
    //console.log('draw', start, end, color);
    socket.emit('drawing', start, end, color);
});



