/* const SocketIOFileUploadServer = require("socketio-file-upload"); */

let socket = io();

function scrollToBottom() {
  let messages = document.querySelector("#messages").lastElementChild;
  messages.scrollIntoView();
}
socket.on("connect", function () {
  console.log("connect to server");

  /*  var uploader=new SocketIOFileUploadServer(socket)
   uploader.listenOnInput(document.getElementById("fileUpload"))
  */
  let searchQuery = window.location.search.substring(1);
  let params = JSON.parse(
    '{"' +
    decodeURI(searchQuery)
      .replace(/&/g, '","')
      .replace(/\+/g, " ")
      .replace(/=/g, '":"') +
    '"}'
  );
  socket.emit("join", params, function (err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    }
  });
});

socket.on("disconnect", () => {
  console.log("Disconnect from server");
});

socket.on("updateUsersList", function (users) {
  let ol = document.createElement("ol");
  users.forEach(function (user) {
    let li = document.createElement("li");
    li.innerHTML = user;
    ol.appendChild(li);
  });
  let usersList = document.querySelector("#users");
  usersList.innerHTML = "";
  usersList.appendChild(ol);
});

socket.on("newMessage", function (message) {
  var formattedTime = moment(message.createdAt).format("LT");
  const template = document.querySelector("#message-template").innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime,
  });

  const div = document.createElement("div");
  div.innerHTML = html;

  document.querySelector("#messages").appendChild(div);
  scrollToBottom();
  /*  console.log("newMessage", message);
  const formattedTime =moment(message.createdAt).format('LT')

  let li = document.createElement("li");
  li.innerText = `${message.from} ${formattedTime} :${message.text}`;
  document.querySelector("body").appendChild(li); */
});

document.querySelector("#submit-btn").addEventListener("click", function (e) {
  //preventDefault -- page in not refresh on submit button click.
  e.preventDefault(); 

  socket.emit("createMessage",    {
      text: document.querySelector('input[name="message"]').value,
      // createdAt: formattedTime
    },  
    function () {
      document.getElementById('input[name="message"]').value = '' 
    }          
  );
  
});

document
  .querySelector("#submit-location")
  .addEventListener("click", function (e) {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by browser");
    }
    navigator.geolocation.getCurrentPosition(
      function (position) {
        socket.emit("createLocationMessage", {
          lnt: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      function () {
        alert("Unable to fetch location");
      }
    );
  });

/* socket.emit(
     "createMessage",
     {
       from: "meet",
       text: "HELLO",
     },
     function (message) {
       console.log("Got it", message);
     }
   ); */
