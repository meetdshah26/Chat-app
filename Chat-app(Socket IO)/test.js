var SocketIOFileUpload = require("socketio-file-upload")
/*  var  socketio = require("socket.io") */
 var express = require("express");
 var app = express()
 var server = require('http').createServer(app);

// Make your Express server:
  app.use(SocketIOFileUpload.router)
  app.use(express.static(__dirname + "/public"))
 
// Start up Socket.IO:
var io = require('socket.io')(server);
server.listen(process.env.PORT || 4000);
io.sockets.on("connection", function (socket) {
  // Make an instance of SocketIOFileUpload and listen on this socket:
  var uploader = new SocketIOFileUpload();
  uploader.dir = "/";
  uploader.listen(socket);

  // Do something when a file is saved:
  uploader.on("saved", function (event) {
    console.log(event.file);
  });

  // Error handler:
  uploader.on("error", function (event) {
    console.log("Error from uploader", event);
  });
});
