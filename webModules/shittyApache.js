var fs = require('fs');
var zlib = require('zlib');
var ss = require('stream-stream');
var mime = require('mime-types');
var Readable = require('stream').Readable
var websiteBase = "website";
var ignoreBase = ["/svgs/"];


function fillPage(fileName)
{
	var data = fs.readFileSync(fileName, "utf8");
	/*
    console.log(data);
	var regex = /<\s*script.*id\s*=\s*"serverExec".*>/
	var startval = regex.exec(data).index;
	var after = data.substring(startval.index,data.length);
	if(after != undefined)
	{
		console.log(after);
		regex = /<\/\s*script\s*>/g;
		console.log(regex.exec(after)[0]);
		console.log(regex.exec(after)[0]);
		var endval = regex.exec(after).index;
		console.log(data.substr(startval,endval));
		console.log(after.substr(after.indexOf(">"),after.match("").index));
	}
    */
	return data;
}




exports.fetchFile = function (request, response) {
	//prep the url with the directory on the server
	var ignore = false;
	for(var i = 0; i < ignoreBase.length;i++)
	{
		if(request.url.indexOf(ignoreBase[i]) == 0)
		{
			ignore = true;
			break;
		}
	}

	request.url = websiteBase+request.url;
	fs.stat(request.url, function(err, stat) {
		//check for errors and return the error page if any errors exist. This is you custom 404 page
		if(mime.lookup(request.url) == false ||err != null && err.code == 'ENOENT')
		{
			stat = fs.statSync(websiteBase+"/error.html");
			response.writeHead(404, {
				'Content-Type': mime.lookup(websiteBase+"/error.html"),
				'Content-Length': stat.size,
				'Cache-Control': 'max-age=31536000'
			});
			var readStream = fs.createReadStream(websiteBase+"/error.html");
			readStream.pipe(response);
		}else if(err == null) {
			//This is where the magic happens. We are loading the fill template if it a first time visit to the page
			//This should allow a crawler to do its thing
			var files = [];
			var type = mime.lookup(request.url);
			if(!ignore &&request.headers["referer"] == undefined && type == 'text/html' || !ignore && request.headers.ajax == undefined && type == 'text/html')
			{
				var files = ['header.html', request.url,'footer.html'];
				if (request.url.indexOf("google") > -1)
				{
					files = [request.url]
				}
				var stream = ss();

				var fileSize = 0;
				/*				for(let i = 0; i < files.length;i++)
				{
					console.log(files[i]);
					stream.write(fs.createReadStream(files[i]));
					fileSize = fs.statSync(files[i]).size;
				}*/

				let index = 0;
                var output = "";
				files.forEach(function(f) {
					stream.write(fs.createReadStream(f));
					fileSize += fs.statSync(f).size;
					index++;
				});
                console.log(output);
				stream.end();

				response.writeHead(200, {
					'Content-Type': 'text/html',
					'Content-Length': fileSize,
                    'Content-Encoding': 'gzip'
				});
				stream.pipe(zlib.createGzip()).pipe(response);
				return;
			}else
			{
                var type = mime.lookup(request.url);
                var headerDetails = {
					'Content-Type': mime.lookup(request.url),
					'Content-Length': stat.size,
                    'Cache-Control': 'max-age=86400'
				}
                if(type == "text/html")
                {
                    headerDetails['Content-Encoding'] = 'gzip'
                }
				response.writeHead(200, headerDetails);
                var readStream = fs.createReadStream(request.url);
				//console.log(request.url);
				if(type == "text/html")
                {
                    //console.log(mime.lookup(request.url));
                    //console.log("zipping");
                    readStream.pipe(zlib.createGzip()).pipe(response);
                }else
                {
                    //console.log(mime.lookup(request.url));
                    //console.log("not zipping");
                    readStream.pipe(response);
                }

			}
		} else {
			console.log('Some other error: ', err.code);
		}
	});

};
