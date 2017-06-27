var fs = require('fs');
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




var dataFileBuffer  = fs.readFileSync(__dirname + '/mnist/images.idx3-ubyte');
var labelFileBuffer = fs.readFileSync(__dirname + '/mnist/labels.idx1-ubyte');
var pixelValues     = [];

// It would be nice with a checker instead of a hard coded 60000 limit here
var testSetImages = [];
var testSetLables = [];
var trainigSetImages = [];
var trainigSetLables = [];
var classifiedImage = 10;//10 - 10,000
var unclassifiedImage = 0;//0-10

var start = new Date().getTime();

function getImage(image)
{
	var pixels = [];
	for (var y = 0; y <= 27; y++) {
		for (var x = 0; x <= 27; x++) {
			pixels.push(dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 16]);
		}
	}
	var imageData = [labelFileBuffer[image + 8],pixels,image];
	return imageData;
}
function getDifference(){
	var unClassified = data.data[0][0];
	var classified = data.data[0][1];
	var sum = 0;
	for(var i = 0; i < unClassified[1].length;i++)
	{
		sum += Math.abs(unClassified[1][i] - classified[1][i]);
	}
	//result,index of unclassified,index of classified,the current classification;
	output = [sum,unClassified[2],classified[2],classified[0]];
	postMessage(output);
	//console.log("the difference is: ");
	//console.log(sum);
	return output;
}
var classifications = [
	{"image":0,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":1,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":2,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":3,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":4,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":5,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":6,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":7,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":8,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]},
	{"image":9,"classification":-1,"nearest":[{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000},{"classification":-1,"distance":200000}]}
]
function getDataToSend()
{
	//Sample value to emit
	//The data must be in an array, not an object so we are able to parse the value later
	//The userFunction is converted to a string before we send it to the user
	var unclassifeid = getImage(unclassifiedImage);
	var classified = getImage(classifiedImage);
	data = [unclassifeid,classified];
	//var userFunction = function(){console.log("data is: ");console.log(data.data[0]);}
	passFunc = ''+getDifference;
	sendInfo = [data,passFunc];
	if(classifiedImage == 100)
	{
		classifiedImage = 0;
		console.log("test image is: "+unclassifiedImage+" true class is: "+ labelFileBuffer[unclassifiedImage + 8])
		for(var i =0;i<classifications[unclassifiedImage].nearest.length;i++)
		{
			console.log(classifications[unclassifiedImage].nearest[i].classification);
		}
		//console.log(classifications[unclassifiedImage].nearest[i]);
		unclassifiedImage ++;

	}
	if(unclassifiedImage > 9)
	{
		sendInfo = -1;
		var end = new Date().getTime();
		var time = end - start;
		console.log('Execution time: ' + time);
	}
	classifiedImage++;
}

io.on('connection', function(socket){
	getDataToSend();
	if(sendInfo == -1){
		return;
	}
	socket.emit('number', sendInfo); // We send some information to our user, for now it is a value. We also need a function

	socket.on('sendBackToServer', function(output){
		//Here you put your check to determine if the client is sending something useful
		//console.log(output);
		for(var i = 0; i < classifications[output[1]].nearest.length;i++)
		{
			var max = classifications[output[1]].nearest[0].distance;
			var maxIndex = 0;

			for (var i = 1; i < classifications[output[1]].nearest.length; i++) {
				if (classifications[output[1]].nearest[i].distance > max) {
					maxIndex = i;
					max = classifications[output[1]].nearest[i].distance;
				}
			}
			if(output[0] < classifications[output[1]].nearest[maxIndex].distance)
			{
				classifications[output[1]].nearest[maxIndex].distance = output[0];
				classifications[output[1]].nearest[maxIndex].classification = output[3]
			}
		}
		getDataToSend();
		//io.sockets.emit('updatedMen',men);
		if(sendInfo == -1){
			return;
		}
		socket.emit('number', sendInfo);
	}); // listen to the event
	console.log("connected");

});

server.listen(80, function(){
	console.log('nodeJS Messages is now online');
});


