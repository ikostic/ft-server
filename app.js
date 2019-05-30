const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const MessagingResponse = require('twilio').twiml.MessagingResponse;

//HTTP Port from environment variable or default - 1337
const httpport = process.env.HTTPPORT || 1337;

//Port from environment variable or default - 4001
const port = process.env.PORT || 4001;

//Setting up express and adding socketIo middleware
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

//Setting up a socket with the namespace "connection" for new sockets
io.on("connection", socket => {
    console.log("New client connected");

    //Here we listen on a new namespace called "incoming data"
    socket.on("incoming data", (data)=>{
        //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
       socket.broadcast.emit("outgoing data", {num: data});
    });

    //A special namespace "disconnect" for when a client disconnects
    socket.on("disconnect", () => console.log("Client disconnected"));
});

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();
    
    twiml.message('The Robots are coming! Head for the hills!');
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});

app.get('/', (req, res) => {
    res.send('<h1>Red Panda UK - Fire-Tec server running</h1>');
});
  
http.createServer(app).listen(httpport, () => {
    console.log(`Express server listening on port ${httpport}`);
});

server.listen(port, () => console.log(`Listening socket on port ${port}`));
