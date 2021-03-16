var templateJS ={};
templateJS.components = {};
templateJS.replaceBody = function(content){document.getElementsByTagName("body")[0].innerHTML = content;};
templateJS.parsePageJson = function(json)
{
	var keys = Object.keys(json);
	for(var i = 0; i < keys.length;i++)
	{
		var nextDepth = json[keys[i]];
		if(nextDepth.container != undefined)
		{
			this.parsePageJson(nextDepth);
		}else if(nextDepth.component != undefined )
		{
			this.fillComponents(nextDepth);
		}
	}
}
templateJS.initPage = function()
{
	var pageJson =
		{
			wrapper1:
			{
				container:"wrapper",
				card1:
				{
					component:"card",
					header:"1st",
					body:"This is the body content",
					footer:"This is the footer"
				},
				card2:
				{
					component:"card",
					header:"2nd",
					body:"This is the body content",
					footer:"This is the footer"
				}
			},
			wrapper2:
			{
				container:"wrapper",

				card2:
				{
					component:"profile",
					src:"4th",
					name:"Google",
					info:"We do everything"
				}
			}
		}
	this.parsePageJson(pageJson);
}

templateJS.init = function()
{
	this.getFile("components/components.json",function(data){
		data = JSON.parse(data);
		for(var i = 0; i < data.length;i++)
		{
			let componentName = data;
			this.getFile("components/"+data[i]+"/component/component.html",function(data){
				this.components[componentName[i]] = data;
			}.bind(this))
		}
		this.openEditor(data);
	}.bind(this));
	for(var i = 0; i < 1;i++)
	{
		this.initPage();
	}
}
templateJS.getFile = function(url,callback)
{
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function()
	{
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				callback(httpRequest.responseText);
			}
		}
	};
	httpRequest.open('GET', url,false);
	httpRequest.send();
}
templateJS.fillComponents = function(component)
{
	var wrap = document.createElement("div");
	var output = this.components[component.component];

	var replaceText = Object.keys(component);
	replaceText.splice(0,1);

	for(var i = 0; i < replaceText.length;i++)
	{
		output = output.replace("${"+replaceText[i]+"}", component[replaceText[i]]);
	}
	wrap.innerHTML =output;
	document.getElementsByTagName("body")[0].appendChild(wrap);
}
templateJS.addJS = function()
{

}
templateJS.addCSS = function()
{

}
templateJS.dialog = {};
templateJS.dialog.initDialog = function(event)
{
	var wrap = document.createElement("div");
	wrap.className="dialog-container";

	this.getFile("/components/"+event.srcElement.getAttribute("component-type")+"/config/config.html",function(data){
		wrap.innerHTML = data;
	});
	document.getElementsByTagName("body")[0].appendChild(wrap);
}
templateJS.addComponent = function(componentName)
{

	var wrap = document.createElement("div");
	wrap.onclick=this.dialog.initDialog.bind(this);
	wrap.setAttribute("component-type",componentName);
	wrap.className = "edit-container";
	wrap.innerHTML="click me to edit";
	document.getElementsByTagName("body")[0].appendChild(wrap);
}
templateJS.openEditor = function(componentList)
{
	var panel = document.createElement("div");
	var inner = '<div class="component-hover"><ul id="component-list">';
	for(var i = 0; i < componentList.length;i++)
		{
			inner += "<li><a href='#' onclick='templateJS.addComponent(\""+componentList[i]+"\")'>"+componentList[i]+"</a></li>";
		}
	inner+='</ul></div>';
	panel.innerHTML = inner;
	document.getElementsByTagName("body")[0].appendChild(panel);
}
function overrideDefault(e)
{
	if(e.target.href.indexOf(e.target.hostname) > -1)
	{
		e.preventDefault();
		getFile(e.target.href,replaceBody);
		return true;
	}

}


console.time('someFunction');
templateJS.init();
console.timeEnd('someFunction')
