var http=require('http');
var executed = false;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var inputFileName = 'inputs.xml';
var outputFileName = 'responseOutput.json'
var missingProperties = [];
var missingOptionalProperties = [];
var server=http.createServer(function(req, res)
{
		res.writeHead(200,{"Content-Type" : "text/html"});
		var fileSystem = require('fs');
		var inputs = fileSystem.readFileSync(inputFileName);
		var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		const HTTP = new XMLHttpRequest();
		url = getUrl(inputs);
		HTTP.open("GET", url);
		HTTP.send();
		HTTP.onreadystatechange = function(){
			fileSystem.writeFile(outputFileName ,HTTP.responseText, function(error) {
		    	if (error) {
		        	console.log(error);
		    	}
		    	else{
		    		var userDetailsResponse = fileSystem.readFileSync(outputFileName);
		    		var requiredProperties = {
		    			"id": "",
		    			"name": "",
		    			"mimeType": ""
		    		};
		    		var additionalProperties = {
		    			"kind": ""
		    		};
		    		
		    		var jsonResponse = JSON.parse(userDetailsResponse);
		    		if(!executed)
		    			console.log(jsonResponse);
		    		missingProperties = [];	
		    		var additionalPropertiesResult = checkOptionalProperties(jsonResponse, additionalProperties);
		    		var receivedOptionalProperties = missingProperties;
		    		if(missingProperties.length > 0 && !executed && additionalPropertiesResult){
		    			console.log("======================================");
		    			console.log("Optional Received Parameters: " +missingProperties);
		    			console.log("======================================");
		    		}
		    		missingProperties = [];
		    		var result = validateResponse(jsonResponse, requiredProperties);
		    		if(missingProperties.length > 0 && !executed){
		    			console.log("======================================");
		    			console.log("Missing Required Parameters: " +missingProperties);
		    			console.log("======================================");
		    		}
		    		
		    		requiredPropertiesArray = toArray(requiredProperties);
		    		if(result){
		    			if(!executed){
		    				console.log("======================================");
		    				console.log("Received all required Parameters");
		    				console.log("======================================");
		    				console.log("======================================");
	    					console.log("STATUS: SUCCESS");
	    					console.log("======================================");
		    			}
		    			if(receivedOptionalProperties.length > 0)
	    					res.end("<html><center><h1>Response Validation</h1><table border='2' cellpadding = '10'><tr><th>Required Properties</th> <th>Missing Properties</th> <th>Optional Received Parameter</th><th>Comments</th> <th>Status</th></tr><tr><td>"+requiredPropertiesArray+"</td><td>-</td><td>"+receivedOptionalProperties+"</td><td>Received all required properties</td><td>PASSED</td></tr></table><center></html>");
	    				else
	    					res.end("<html><center><h1>Response Validation</h1><table border='2' cellpadding = '10'><tr><th>Required Properties</th> <th>Missing Properties</th> <th>Optional Received Parameter</th><th>Comments</th> <th>Status</th></tr><tr><td>"+requiredPropertiesArray+"</td><td>-</td><td>-</td><td>Received all required properties</td><td>PASSED</td></tr></table><center></html>");
		   			}
		   			else{
		   				if(!executed){
		   					console.log("======================================");
		    				console.log("Error: Missing required Parameters");
		    				console.log("======================================");
		    				console.log("======================================");
		    				console.log("STATUS: FAILED");
		   					console.log("======================================");
		   				}
		   				if(receivedOptionalProperties.length > 0)
		   					res.end("<html><center><h1>Response Validation</h1><table border='2' cellpadding = '10'><tr><th>Required Properties</th> <th>Missing Properties</th> <th>Optional Received Parameter</th> <th>Comments</th><th>Status</th></tr><tr><td>"+requiredPropertiesArray+"</td><td>"+missingProperties+"</td><td>"+receivedOptionalProperties+"</td><td>Failed receiving all required properties</td><td>FAILED</td></tr></table><center></html>");
		   				else
		   					res.end("<html><center><h1>Response Validation</h1><table border='2' cellpadding = '10'><tr><th>Required Properties</th> <th>Missing Properties</th> <th>Optional Received Parameter</th> <th>Comments</th> <th>Status</th></tr><tr><td>"+requiredPropertiesArray+"</td><td>"+missingProperties+"</td><td>-</td><td>Failed receiving required properties</td><td>FAILED</td></tr></table><center></html>");
	    			}
		    		executed = true;
		    	}
			});

		}
	if(executed)
		process.exit(0);
}).listen(8080);

function validateResponse(jsonResponse, requiredProperties){
	var value = true;
	var len = Object.keys(requiredProperties).length;
	for(var i = 0; i<len; i++){
		if(!isPresent(jsonResponse, Object.keys(requiredProperties)[i])){
			missingProperties.push(Object.keys(requiredProperties)[i]);
			value = false;
		}
	}
	return value;
}

function checkOptionalProperties(jsonResponse, additionalProperties){
	var value = false;
	var len = Object.keys(additionalProperties).length;
	for(var i = 0; i<len; i++){
		if(isPresent(jsonResponse, Object.keys(additionalProperties)[i])){
			missingProperties.push(Object.keys(additionalProperties)[i]);
			value = true;
		}
	}
	return value;
}

function isPresent(jsonResponse, value) {
	var len = Object.keys(jsonResponse).length;
	for(var i = 0; i<len; i++){
		if(Object.keys(jsonResponse)[i] == value){
			return true;
		}
	}
	return false;
}

function toArray(requiredProperties) {
	var value = [];
	var len = Object.keys(requiredProperties).length;
	for(var i = 0; i<len ; i++){
		value.push(Object.keys(requiredProperties)[i]);
	}
	return value;	
}

function getUrl(inputs) {
	const domStructure = new jsdom.JSDOM(inputs);
	var accessURL = domStructure.window.document.getElementById(0).getAttribute("urlID");
	var fileID = domStructure.window.document.getElementById(0).getAttribute("fileID");
	var key = domStructure.window.document.getElementById(0).getAttribute("key");
	return accessURL + fileID +key;
}