var http=require('http');
var executed = false;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var inputFileName = 'inputs.xml';
var outputFileName = 'responseOutputs.json'
var id = 3;
var url, methodType;
var requiredProperties;
var server = http.createServer(function(req,res){
	res.writeHead(200,{"Content-Type" : "text/html"});
	var fileSystem = require('fs');
	var inputs = fileSystem.readFileSync(inputFileName);
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	const HTTP = new XMLHttpRequest();
	getInputs(inputs, id);
	HTTP.open(methodType, url);
	HTTP.send();
	HTTP.onreadystatechange = function(){
		fileSystem.writeFile(outputFileName ,HTTP.responseText, function(error) {
			if (error) {
				console.log(error);
			}
			else{
				var userDetailsResponse = fileSystem.readFileSync(outputFileName);
	 			var jsonResponse = JSON.parse(userDetailsResponse);
	 			if(!executed)
	 				console.log(jsonResponse);
	 			var missingRequiredProperties = [];
	 			missingRequiredProperties = compareProperties(requiredProperties, jsonResponse);
	 			requiredPropertiesArray = toArray(requiredProperties);
	 			if(missingRequiredProperties.length !== 0){
	 				if(!executed){
	 					console.log("======================================");
		    			console.log("Error: Missing required Parameters ("+missingRequiredProperties+")");
		    			console.log("======================================");
		    			console.log("======================================");
		    			console.log("STATUS: FAILED");
		   				console.log("======================================");
	 				}
	 				res.end("<html><center><h1>Response Validation</h1><table border='2' cellpadding = '10'><tr><th>Required Properties</th> <th>Missing Properties</th> <th>Additional Parameter</th> <th>Comments</th><th>Status</th></tr><tr><td>"+requiredPropertiesArray+"</td><td>"+missingRequiredProperties+"</td><td>-</td><td>Failed receiving all required properties</td><td>FAILED</td></tr></table><center></html>");
	 			}
	 			else{
	 				var additionalProperties = [];
	 				additionalProperties = compareProperties(jsonResponse, requiredProperties);
	 				if(!executed){
	 					console.log("======================================");
		    			console.log("Received all required Parameters");
		    			console.log("======================================");
		    			if(additionalProperties.length != 0){
		    				console.log("======================================");
		    				console.log("Additional Parameters: "+additionalProperties);
		    				console.log("======================================");
		    			}
		    			console.log("======================================");
	    				console.log("STATUS: SUCCESS");
	    				console.log("======================================");
	 				}
	 				if(additionalProperties.length == 0)
	 					res.end("<html><center><h1>Response Validation</h1><table border='2' cellpadding = '10'><tr><th>Required Properties</th> <th>Missing Properties</th> <th>Additional Parameter</th> <th>Comments</th><th>Status</th></tr><tr><td>"+requiredPropertiesArray+"</td><td>-</td><td>-</td><td>Received all required properties</td><td>PASSED</td></tr></table><center></html>");
	 				else
	 					res.end("<html><center><h1>Response Validation</h1><table border='2' cellpadding = '10'><tr><th>Required Properties</th> <th>Missing Properties</th> <th>Additional Parameter</th> <th>Comments</th><th>Status</th></tr><tr><td>"+requiredPropertiesArray+"</td><td>-</td><td>"+additionalProperties+"</td><td>Received all required properties</td><td>PASSED</td></tr></table><center></html>");
	 			}
	 			executed = true;	
			}
		});
	}	
	if(executed)
		process.exit(0);
}).listen(4040);

function compareProperties(jsonValue1, jsonValue2) {
	var properties = [];
	var len = Object.keys(jsonValue1).length;
	for (var i = 0; i < len; i++) {
		if(!isPresent(jsonValue2, Object.keys(jsonValue1)[i])){
			properties.push(Object.keys(jsonValue1)[i]);
		}
	}
	return properties;
}

function isPresent(jsonProperties, value) {
	var len = Object.keys(jsonProperties).length;
	for(var i = 0; i<len; i++){
		if(Object.keys(jsonProperties)[i] == value){
			return true;
		}
	}
	return false;
}
function toArray(jsonProperties) {
	var value = [];
	var len = Object.keys(jsonProperties).length;
	for(var i = 0; i<len ; i++){
		value.push(Object.keys(jsonProperties)[i]);
	}
	return value;	
}
function getInputs(inputFile, id) {
	const domStructure = new jsdom.JSDOM(inputFile);
	var accessURL = domStructure.window.document.getElementById(id).getAttribute("url");
	var path = domStructure.window.document.getElementById(id).getAttribute("path");
	var key = domStructure.window.document.getElementById(id).getAttribute("key");
	url = accessURL + path + key;
	methodType = domStructure.window.document.getElementById(id).getAttribute("methodType");
	var requiredScema = domStructure.window.document.getElementById(id).getAttribute("schema");
	requiredProperties = JSON.parse(requiredScema);
}
