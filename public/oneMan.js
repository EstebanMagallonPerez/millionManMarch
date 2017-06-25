self.addEventListener('message',function(data){
	//this is the data passed by the server
	var parsed = data.data[0];
	//We store the function that the server sent into a function variable so we can execute it
	eval("var temp =" + parsed.userFunc)
	temp();
})
