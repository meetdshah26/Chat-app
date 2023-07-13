const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const mongoClient = require('mongodb').MongoClient;

const dbname = 'chatApp';
const chatCollection = 'chats'; //collection to store all chats
const database = 'mongodb://localhost:27017/';

const generateMessage = require("./utils/message");
const isRealString = require("./utils/isRealString");
const { Users } = require("./utils/users");
const users = new Users();

const PublicPath = path.join(__dirname, "/../public");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(PublicPath));

io.on("connection", (socket) => {

  console.log("New user Connected!!");

  socket.on("join", (params, cb) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return cb("Name and Room details are required...");
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit("updateUsersList", users.getUserList(params.room));

    socket.emit(
      "newMessage",
      generateMessage("Admin", "Welcome to chat App!!")
    );
  
    // let user2 = users.removeUser(socket.id)    
    //To send everyone except who send the message...use socket.to
    socket.broadcast
      .to(params.room)
      .emit("newMessage", generateMessage("Admin", `New User Connected.`));
      // .emit("newMessage", generateMessage("Admin", `New User ${user2.name} Connected.`));
    cb();
  });

  socket.on("createMessage", (message, cb) => {
    let dataElement = generateMessage(message)

    let user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit(
        "newMessage",
        generateMessage(user.name, message.text)
      );
    }    
    // console.log("createMessage ->", message);
    // console.log("user >>",user);

    mongoClient.connect(database, (err, db) => {
      if (err)
        throw err
      else {
        var chat = db.db(dbname).collection(chatCollection);
        var obj = {
          name: user.name,
          room: user.room,
          text: dataElement.from.text,
         // createdAt: dataElement.createdAt,
          Date:new Date()
        }        
        chat.insertOne(obj, (err, res) => { //inserts message  into the database
          if (err) throw err;
        });        
      }
    })
  });

  socket.on("createLocationMessage", (coords) => {
    io.emit(
      "newMessage",
      generateMessage("Admin", `${coords.lnt},${coords.lng}`)
    );
  });

  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("updateUsersList", users.getUserList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage(
          "Admin",
          `${user.name} has left ${user.room} chat room.`
        )
      );
    }
  });
});

const port = process.env.port || 4000;
server.listen(port, () => {
  console.log("server is up on 4000");
});