const express = require('express')
const app = express();
var server = require('http').createServer(app);
const io = require('socket.io')(server);
var room = [];
var user_list = {}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
    socket.on('createroom', function(data){

        if (!(room.includes(data["id"]))) {
            console.log('newroom');
            socket.join(data["id"]);
            room.push(data["id"]);
            user_list[data["id"]] = []
            io.to(socket.id).emit("host", true);

        } else {
            console.log("longin")
            socket.join(data["id"]);
            io.to(socket.id).emit("host", false);
            io.to(socket.id).emit("user_list", user_list[data["id"]]);
            user_list[data["id"]].push(data["name"])
            io.to(data["id"]).emit("add_user", {"name":data["name"]});
        }


    })
    socket.on('leave', function(data){
        console.log("leave")
        console.log(data["name"])
        if (data["host"]) {
            io.to(data["id"]).emit('delete', {"id": data["id"]});
            socket.leave(data["id"]);
            room.splice(room.indexOf(data["id"]), 1);
            delete user_list[data["id"]]
        } else {
            io.to(data["id"]).emit('remove_user', {"name":data["name"]});
            socket.leave(data["id"]);
        }

    })
    socket.on('push', function(data){
        console.log("push");
        io.to(data["id"]).emit('push_user', {"name": data["name"]});
    });
    socket.on('reset', function(data){
        console.log("reset");
        io.to(data["id"]).emit("reset", true);
    });
});
server.listen(3000);
