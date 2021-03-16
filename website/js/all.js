var navbar = {};
navbar.init = function()
{
	var togglers = document.getElementsByClassName("nav-toggle");
	for(var i =0; i < togglers.length;i++)
	{
		togglers[i].addEventListener("click", function(e){
			this.navbar.getElementsByClassName("nav-menu")[0].classList.toggle("active");
		}.bind(this), true);
	}
};
navbar.navbar = document.getElementsByTagName("nav")[0];
navbar.init();
var svg = {};

svg.init = function(){
	for(var i =0; i < this.svgs.length;i++)
	{
		let obj = {};
		let elem = this.svgs[i];
		obj.elem = elem;
		this.getSVG("svgs/"+this.svgs[i].attributes["data-name"].value,obj);
	}
}
svg.cache = [];
svg.svgs = document.getElementsByClassName("svg");
svg.getSVG = function(fileName,obj)
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', fileName, true);

	xhr.onload = function (data) {
		obj.data = xhr.responseText;
		this.cache.push(obj);
		console.log(this.cache.length);
		console.log(this.svgs.length);
		if(this.cache.length == this.svgs.length)
		{
			this.fill();
		}
	}.bind(this);

	xhr.send(null);
}
svg.fill = function()
{
	console.log("filling");
	for(var i=0; i < this.cache.length;i++)
	{
		this.cache[i].elem.innerHTML = this.cache[i].data;
	}
}
function resizeIFrameToFitContent( iFrame ) {

    iFrame.width  = iFrame.contentWindow.document.body.scrollWidth;
    iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
}

window.addEventListener('DOMContentLoaded', function(e) {
    // or, to resize all iframes:
    var iframes = document.querySelectorAll("iframe");
    for( var i = 0; i < iframes.length; i++) {
        resizeIFrameToFitContent( iframes[i] );
    }
} );
