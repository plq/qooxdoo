var fs = require('fs');
var util = require("util");
var static = require('node-static');

var http = require("http").createServer(handleFunction);
http.listen(8000);

var fileServer = new static.Server('../');

var masterClient = null;
var clients = [];

function handleFunction(request, response) {
  
  if(request.url === "/") {
    response.writeHead(302, {location: "/server/index.html"});
    response.end();
  }
  
  else if(request.url == "/master") {
    setUpResponseForSSE(response);
    masterClient = response;
  }
  
  else if(request.url == "/results") {
    //Check if it really is a POST-request
    if (request.method == "POST") {

      var fullBody = '';

      // as long as data come in, append the current chunk of data to the fullBody variable
      request.on('data', function(chunk) {
          fullBody += chunk.toString();
        });

      // request ended, so print the body to the console
      request.on('end', function() {
        response.writeHead(200);
        // response.writeHead(200, "OK", {'Content-Type': 'text/plain'})3;
        response.end();
        
        masterClient.write('event:results' + '\n' +
                          'data:' + fullBody + '\n\n'); 
      });
    }
  }
  
  else if(request.url == "/events") {
    
    //console.log(detectMobileDevice(request.headers["user-agent"]));
    
    
    // TODO Handling for reconnect (last-event-id)
    clients.push(response);
    var clientId = clients.indexOf(response)+1;
    
    setUpResponseForSSE(response);
    
    if(masterClient != null) {
      masterClient.write('event:clientJoined' + '\n' +
                            'data:' + clientId + '\n\n');
      response.write('event:clientId' + '\n' +
                          'data:' + clientId + '\n\n'); 
    }
    
    else {
      response.end();
    }
    
    var buildTests = "../component/testrunner/build/script/tests.js"
    var sourceTests = "../component/testrunner/source/script/tests-source.js"
    
    fs.watchFile(buildTests, function (curr, prev) {
    
      fs.readFile(buildTests, function (err, data) {
        if (err) throw err;
      
        var sseData = String(data).replace(/(\r\n|\n|\r)/gm, "\ndata:");
    
        //console.log(fileName, "changed");
    
        var responseText = [
            'event:' + 'autCode',
            'data:' + sseData
          ].join("\n") + "\n\n";
    
        response.write(responseText);
        console.log(sseData);
      });
    });
    
    fs.watchFile(sourceTests, function(curr, prev) {
      var responseText = [
          'event:' + 'autUri',
          'data:' + "html/tests-source.html"
        ].join("\n") + "\n\n";
    
      response.write(responseText);
    });
   
    request.on('close', function () {
      var clientId = clients.indexOf(response);
      delete clients[clientId];
      
      if(masterClient != null) {
        masterClient.write('event:clientLeft' + '\n' +
                            'data:' + (clientId+1) + '\n\n'); 
      }
      
    });

  }
  else {
    request.addListener('end', function () {
      fileServer.serve(request, response, function (err, result) {
        if (err) { // There was an error serving the file
          util.error("Error serving " + request.url + " - " + err.message);
    
          // Respond to the client
          response.writeHead(err.status, err.headers);
          response.end();
        }
      });
    });
  }
}

function setUpResponseForSSE (response) {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    //neccessary for IE
    "Access-Control-Allow-Origin": "*"
  });
    
  //2kb padding for IE
  response.write(':' + Array(2049).join(' ') + '\n');
  
  /**
   * sending a periodic comment for keeping connection alive
   * is recommended especially for IE 
   */
  setInterval(function () {
    response.write(':\n');
  } , 15000); 
}

function detectMobileDevice(userAgentString){
  var reg = /android.+mobile|ip(hone|od)|bada\/|blackberry|maemo|opera m(ob|in)i|fennec|NetFront|phone|psp|symbian|windows (ce|phone)|xda/i
  var match = reg.exec(userAgentString);
  
  if (match && match[1]) {
    return match[0];
  } 
  else {
    return "Desktop"
  }
}
 

// var io = require('socket.io').listen(http);
// 
// io.sockets.on('connection', function (socket) {
// 
//   var fileName = "component/testrunner/source/script/tests-source.js";
// 
//   fs.watchFile(fileName, function (curr, prev) {
//     
//     fs.readFile(fileName, function (err, data) {
//       if (err) throw err;
//       //console.log(data);
//       socket.emit('testsuitechange', data.toString());
//     });
//   });
//   
//   socket.on('callback', function(data) {
//     console.log("What came back: " + data.toString());
//   });
// });