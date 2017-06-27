self.addEventListener('message',function(data){
	//this is the data passed by the server
//	console.log(data.data[0]);
//	var parsed = data.data[0];
	//We store the function that the server sent into a function variable so we can execute it
	eval("var temp =" + data.data[1])
	postMessage(temp());
})
