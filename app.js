var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

var port = process.env && process.env.PORT || 3000;

app.use(express.static(__dirname + '/'));

var activitiesExecuted = [];

app.post('/activity-execute', function(req, res) {
    res.send(JSON.stringify({
        status: 'OK'
    }));

    var timestamp = moment();

    activitiesExecuted.push({
        timestamp: timestamp
        , interaction: 'Unknown'
    });

    console.log('Activity executed at time: ', timestamp.format('MMMM Do YYYY, h:mm:ss a'), ' - total activities executed: ', activitiesExecuted.length);
    io.emit('ACTIVITIES_EXECUTED', activitiesExecuted);
    io.emit('LOG_REQUEST_DETAILS', req);
});

io.on('connection', function(socket) {
    socket.on('getActivitiesExecuted', function() {
        io.emit('ACTIVITIES_EXECUTED', activitiesExecuted);
    });

    socket.on('resetActivitiesExecuted', function() {
        console.log('Executed activity list reset.');
        activitiesExecuted = [];
        io.emit('ACTIVITIES_EXECUTED', activitiesExecuted);
    });
});

http.listen(port, function() {
    console.log('Listening on port ', port, '...');
});