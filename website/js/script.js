var currentPage =  location.href;
function loadPage(path){
	console.log("triggered ajax");
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			currentPage = path;
			document.getElementById("landing").innerHTML = xhttp.responseText;
		}
	};

	xhttp.open("GET", path, true);
	xhttp.setRequestHeader("ajax", "true");
	xhttp.send();
}
var ajaxLoader = {
	'init' : function()
	{
		document.addEventListener("click", function (e) {
			var sameSource = location.host == e.target.host;
			if(e.target.hash == "" && sameSource)
			{
				//console.log("ajax page load");
				let path = e.target.pathname;
				if(path == "/")
				{
					path ="";
				}
				history.pushState(null, null, path);
				loadPage(path);
				e.preventDefault();
				return false;

			}/*else if(e.target.hash != undefined && sameSource)
			{
				console.log("hash change");
				//location.hash = e.target.hash
			}else
			{
				console.log("external??");
			}*/
		});
		window.addEventListener('popstate',function(event){
			let path = event.target.location.pathname;
			if(path == "/")
			{
				path ="";
			}
			var hasHash = event.target.location.href.indexOf("#") > -1;
			var sameTarget = event.target.location.pathname == currentPage;
			if(hasHash && sameTarget || sameTarget && !hasHash)
			{
				return false;
			}else
			{
				loadPage(path);
			}

		},false)
	},
}
function serverQuery(predefinedQuery, elemId, callback)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var content = callback(xhttp.responseText);
			currentPage = path;
			document.getElementById("landing").innerHTML = xhttp.responseText;
		}else{
			content = "Error Executing Query"
		}
	};
	xhttp.open("GET", "queryDatabase/"+predefinedQuery, true);
	xhttp.setRequestHeader("innerAjax", "true");
	xhttp.send();
}
if(/bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent))
{
	console.log("Hello Bot, Im making things easy for you by enabling standard loading instead of ajax loading :)");
}else
{
	ajaxLoader.init();
}
