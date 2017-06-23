self.addEventListener('message',function(e){
	var men = parseInt(e.data);
	postMessage(men++);
})
