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
var dataFileBuffer  = fs.readFileSync(__dirname + '/mnist/images.idx3-ubyte');
var labelFileBuffer = fs.readFileSync(__dirname + '/mnist/labels.idx1-ubyte');
var classifiedImage = 10;	//10 - 10,000
var unclassifiedImage = 0;	//0-10
var numNeighbors = 5;

var start = new Date().getTime();


//This gets an image from our mnist file and returns an array with:
//[label, array of pixels, the index of this image]
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

//This function is passed to the user, and the result is returned in the format
//[distance, index of unclassified, index of classified, classification]
//image 1 is not classified, image 2 is
function getDifference(){
	var image1 = data.data[0][0];
	var image2 = data.data[0][1];
	var distance = 0;
	for(var i = 0; i < image1[1].length;i++)
	{
		distance += Math.abs(image1[1][i] - image2[1][i]);
	}
	output = [distance,image1[2],image2[2],image2[0]];
	return output;
}
//Here we define our storage method
//There are 10 testing values, and the number of neighbors will change based on the preset value
var classifications = [];
for(let i = 0; i < 10; i++)
{
	var neighbors = [];
	for(var j = 0; j < numNeighbors;j++)
	{
		neighbors.push({"classification":-1,"distance":200000});
	}
	classifications.push({"image":i,"classification":-1,"nearest":neighbors})
}

//Preparing the data to be sent to the client
//NOTE that for some reason objects cannot be sent. all the data was lost when I tried that.
//The function that send must be converted into a string... at least that seems to be the only thing that worked for me
//
function getDataToSend()
{
	var unclassifeid = getImage(unclassifiedImage);
	var classified = getImage(classifiedImage);
	data = [unclassifeid,classified];
	passFunc = ''+getDifference;
	var toSend = [data,passFunc];
	if(classifiedImage == 110)
	{
		classifiedImage = 10;
		console.log("test image is: "+unclassifiedImage+" true class is: "+ labelFileBuffer[unclassifiedImage + 8])
		console.log(classifications[unclassifiedImage].nearest);
		unclassifiedImage ++;
		if(unclassifiedImage == 10)
		{
			sendInfo = -1;
			var end = new Date().getTime();
			var time = end - start;
			console.log('Execution time: ' + time);
			return -1;
		}
	}
	classifiedImage++;
	return toSend;
}

io.on('connection', function(socket){
	var toSend =  getDataToSend();
	if(toSend == -1){
		return;
	}
	socket.emit('number', toSend);

	socket.on('sendBackToServer', function(output){
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
		toSend = getDataToSend();
		if(toSend == -1){
			return;
		}
		socket.emit('number', toSend);
	});
	console.log("connected");

});

server.listen(80, function(){
	console.log('nodeJS Messages is now online');
});


