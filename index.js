/*
IOS DEPENDANCIES/SETUP
	- enable SSH over WiFi https://www.reddit.com/r/jailbreak/comments/5s19qg/tutorial_ssh_over_wifi_with_yalu102_jb/
	- install SQLite 3.x from Cydia/Telesphoreo repo
	- install CLSMS from https:// s1ris.github.io/repo
*/
var fs 					= require('fs');
var express 			= require('express');
var http 				= require('http');
var app 				= express();
var server 				= http.createServer(app);
var io 					= require('socket.io').listen(server);


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendfile('./public/index.html');
});
var men = 0;
io.on('connection', function(socket){


	socket.emit('number', men); // One more man is in our army

	socket.on('sendBackToServer', function(number){
		console.log(number);
		men = number;
		socket.emit('updatedMen',men);
	}); // listen to the event
	console.log("connected");

});

server.listen(80, function(){
	console.log('nodeJS Messages is now online');
});
