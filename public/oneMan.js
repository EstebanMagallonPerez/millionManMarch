self.addEventListener('message',function(data){
	eval("var temp =" + data.data[1]);//evalueate the function sent by the server
	postMessage(temp());
})
