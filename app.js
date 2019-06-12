const express = require("express");
const http = require("http");
const https = require("https");
const socketIo = require("socket.io");
const MessagingResponse = require('twilio').twiml.MessagingResponse;

//HTTP Port from environment variable or default - 1337
const httpport = process.env.HTTPPORT || 1337;

//Port from environment variable or default - 4001
const port = process.env.PORT || 4001;

let sslOptions = null

const getSslOptions = () => {
	if (sslOptions === null){
		const fs = require('fs')
		const path = require('path')
		const crtPath = path.resolve('cert') + '/'
		sslOptions = {
			pub: fs.readFileSync(crtPath + 'server-pub.pem'),
			key: fs.readFileSync(crtPath + 'server-key.pem'),
			cert: fs.readFileSync(crtPath + 'server-crt.pem'),
			ca: fs.readFileSync(crtPath + 'ca-crt.pem')
		}
	}
	return sslOptions
}

//Setting up express and adding socketIo middleware
const app = express();
//const server = https.createServer(getSslOptions(),app);
const server = http.createServer(app);
const io = socketIo(server);

let activeDoors = []
const doorsLen = 16
const pingClientEvery = 10 // send open/close every (in seconds)
const toggleRandomDoor = (socket) => {
	const doorNum = Math.floor(Math.random() * doorsLen)
	doorClosed = activeDoors.indexOf(doorNum) === -1
	const action = doorClosed ? 'open' : 'close'
	if (doorClosed){
		activeDoors.push(doorNum)
	} else {
		activeDoors.splice(activeDoors.indexOf(doorNum), 1)

	}
	socket.emit(action + ' door', doorNum)
	console.log('sending "' + action + ' the door at floor #' + doorNum + '" event to client')
}

//Setting up a socket with the namespace "connection" for new sockets
io.on("connection", socket => {
	console.log("New client connected [" + socket.id + "]");

    //Here we listen on a new namespace called "incoming data"
    socket.on("incoming data", (data)=>{
        //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
       socket.broadcast.emit("outgoing data", {num: data});
    });

	//const socketEmitter = setInterval(() => { toggleRandomDoor(socket)}, pingClientEvery * 1000)

    //A special namespace "disconnect" for when a client disconnects
	socket.on("disconnect", () => {
		//clearInterval(socketEmitter)
		//activeDoors = []
		console.log("Client disconnected")
	})
})

app.post('/sms', (req, res) => {
	io.sockets.emit('open door', 12)
	res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Hello');
    //const twiml = new MessagingResponse();

    //twiml.message('The Robots are coming! Head for the hills!');

    //res.writeHead(200, {'Content-Type': 'text/xml'});
    //res.end(twiml.toString());
});

app.get('/', (req, res) => {
    res.send('<h1>Red Panda UK - Fire-Tec server running</h1>');
});

/*
https.createServer(getSslOptions(),app).listen(httpport, () => {
    console.log(`Express server listening on port ${httpport}`);
});
*/

http.createServer(app).listen(httpport, () => {
    console.log(`Express server listening on port ${httpport}`);
});

server.listen(port, () => console.log(`Listening socket on port ${port}`));
