var fs = require('fs');
const apache = require('./webModules/shittyApache');
var express 			= require('express');
var http 				= require('http');
var app 				= express();
var server 				= http.createServer(app);
var io 					= require('socket.io').listen(server);


//app.use(express.static(__dirname + '/website'));

app.get('/*', function(req, res){
	console.log("getting",req.url)
	if (req.url == "/")
	{
		req.url = "/index.html";
	}
	var result = apache.fetchFile(req, res);
});

var dataFileBuffer  = fs.readFileSync(__dirname + '/mnist/images.idx3-ubyte');
var labelFileBuffer = fs.readFileSync(__dirname + '/mnist/labels.idx1-ubyte');
var classifiedImage = 10;	//10 - 10,000
var unclassifiedImage = 0;	//0-10
var numNeighbors = 5;
var numsToTest = []

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
	//console.log(pixels)
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
var neighbors = [];
	for(var j = 0; j < numNeighbors;j++)
	{
		neighbors.push({"classification":-1,"distance":200000});
	}
classifications.push({"classification":-1,"nearest":neighbors})

//Preparing the data to be sent to the client
//NOTE that for some reason objects cannot be sent. all the data was lost when I tried that.
//The function that send must be converted into a string... at least that seems to be the only thing that worked for me
//
function getDataToSend()
{
	if (numsToTest.length == 0){return -2;}
	var unclassifeid = [-1,numsToTest[0],-1]
	//getImage(unclassifiedImage);
	var classified = getImage(classifiedImage);
	data = [unclassifeid,classified];
	passFunc = ''+getDifference;
	var toSend = [data,passFunc];
	if(classifiedImage == 5000)
	{
		classifiedImage = 0;
		console.log("test image is: "+unclassifiedImage+" true class is: "+ labelFileBuffer[unclassifiedImage + 8])
		console.log(classifications[unclassifiedImage].nearest);
		var temp = [];
		for(var j = 0; j < numNeighbors;j++)
		{
			temp.push({"classification":-1,"distance":200000});
		}
		classifications[unclassifiedImage].nearest = temp
		numsToTest.shift();
		var end = new Date().getTime();
		var resolution = end - start;
		var resolutionTime = (resolution / 1000)
		console.log("total exec took: ",resolutionTime)
	}
	classifiedImage++;
	return toSend;
}

io.on('connection', function(socket){
	console.log("connected start");
	var toSend =  getDataToSend();
	if(toSend == -1){
		return;
	}
	if(numsToTest.length > 0){
		socket.emit('number', getDataToSend());	
	} 
	
	socket.on('addNumber', function(output)
	{
		numsToTest.push(output);
		var toSend =  getDataToSend();
		socket.emit('number', toSend);	
		socket.broadcast.emit('number', toSend);
	});

	socket.on('sendBackToServer', function(output){
		if (classifications[0] != undefined)
		{
			var maxDist = classifications[0].nearest[0].distance;
			var maxIndex = 0;
			for (var i = 1; i < classifications[0].nearest.length; i++) {
				if (classifications[0].nearest[i].distance > maxDist)
				{
					var maxDist = classifications[0].nearest[i].distance;
					var maxIndex = i;
				}
			}
			if(output[0] < classifications[0].nearest[maxIndex].distance)
			{
				if(numsToTest.length > 0){
					classifications[0].nearest[maxIndex].distance = output[0];
					classifications[0].nearest[maxIndex].classification = output[3]
					for(var i = 0; i <classifications[0].nearest.length ;i++)
					{
						getImage(classifications[0].nearest.index);
					}
					socket.emit('setNearest', classifications[0].nearest);
					socket.broadcast.emit('setNearest', classifications[0].nearest);
				}
			}
		}else{
			console.log("cant record classifications")
		}
		toSend = getDataToSend();
		if(toSend == -1){
			return;
		}
		socket.emit('number', toSend);
	});
	console.log("connected");

});

server.listen(7777, function(){
	console.log('Knn distributed network is running');
});


