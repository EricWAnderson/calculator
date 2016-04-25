var express = require('express');
var index = require('./routes/index.js');
var mongoose = require('mongoose');

var app = express();

//[][][][][][][][][][][][][][][][][][][]
//            Mongo models
//[][][][][][][][][][][][][][][][][][][]

var Calculations = require('../models/calculations');

//[][][][][][][][][][][][][][][][][][][]
//         Initiate server
//[][][][][][][][][][][][][][][][][][][]

var server = app.listen(process.env.PORT || 3000, function(){
  var port = server.address().port;
  console.log('listening on port,', port);
});

//[][][][][][][][][][][][][][][][][][]
//         Configure routes
//[][][][][][][][][][][][][][][][][][]

app.use(express.static('server/public'));
app.use('/', index);

//[][][][][][][][][][][][][][][][][][][]
//       MongoDB connection
//[][][][][][][][][][][][][][][][][][][]

var mongoURI = 'mongodb://calculator:calc@ds047652.mlab.com:47652/calculator';
var MongoDB = mongoose.connect(mongoURI).connection;

MongoDB.on('error', function(err) {
    console.log('mongodb connection error:', err);
});
MongoDB.once('open', function() {
    console.log('mongodb connection open!');
});

//[][][][][][][][][][][][][][][][][][]
//           Web sockets
//[][][][][][][][][][][][][][][][][][]

var io = require('socket.io')(server);

var masterResultArray = [];

//get old calculations from database
Calculations.find({}, function(err, calculations){
if(err){
  console.log(err);
} else {
  masterResultArray = calculations[0].results;
}
});

//socket.io web sockets implementation
io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('results', masterResultArray);  //send results when user connects

  socket.on('disconnect', function(){
    console.log('a user disconnected');
  });

  //listen for events emitted from users
  socket.on('results', function(resultArray){
    masterResultArray = resultArray;
    io.emit('results', masterResultArray);

    //grab existing calculations from database and delete
    Calculations.find({}).remove().exec();

    //save new results array to database
    var newCalculations = new Calculations ({
      results: masterResultArray
    });

    newCalculations.save(function(err, saved){
      if(err){
        console.log(err);
      }
      console.log('saved', saved);
    });

  });
});
