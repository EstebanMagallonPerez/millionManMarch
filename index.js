/*
IOS DEPENDANCIES/SETUP
	- enable SSH over WiFi https://www.reddit.com/r/jailbreak/comments/5s19qg/tutorial_ssh_over_wifi_with_yalu102_jb/
	- install SQLite 3.x from Cydia/Telesphoreo repo
	- install CLSMS from https:// s1ris.github.io/repo
*/
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
var sendInfo;
function getDataToSend()
{
	//Sample value to emit
	//The data must be in an array, not an object so we are able to parse the value later
	var data = [men];
	//The userFunction is converted to a string before we send it to the user
	var userFunction = function(){var men = parseInt(parsed.data[0]);postMessage(++men);}
	passFunc = ''+userFunction;
	sendInfo = {"data":data,"userFunc":passFunc};
	console.log(JSON.stringify(sendInfo));
}

io.on('connection', function(socket){
	getDataToSend();
	socket.emit('number', sendInfo); // We send some information to our user, for now it is a value. We also need a function

	socket.on('sendBackToServer', function(number){
		//Here you put your check to determine if the client is sending something useful
		if(number > men)
		{
			men = number;
			getDataToSend();
			io.sockets.emit('updatedMen',men);
		}
		socket.emit('number', sendInfo);
	}); // listen to the event
	console.log("connected");

});

server.listen(80, function(){
	console.log('nodeJS Messages is now online');
});
