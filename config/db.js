var mongoose = require('mongoose');
var dburl = 'mongodb://gary:gary@ds131258.mlab.com:31258/jobbunny';

var options = {
  server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};
mongoose.connect(dburl, options);
mongoose.Promise = global.Promise;
var conn = mongoose.connection;

// db connection event handlers
conn.on('connected', function(){
  console.log('Mongoose is connected to ' + dburl);
});
conn.on('disconnected', function(){
  console.log('Mongoose disconnected');
});
conn.on('error', function(err){
  console.log('Mongoose connection error:' + err);
});

// node process event handler - close connection on app kill
// linux servers fire SIGINT
process.on('SIGINT', function() {
  conn.close(function(){
    console.log('Mongoose connection disconnected through app termination');
    process.exit(0);
  });
});
// heroku fires SIGTERM
process.on('SIGTERM', function() {
  conn.close(function(){
    console.log('Mongoose connection disconnected through app termination');
    process.exit(0);
  });
});

module.exports = { dbUrl: dburl }

// import mongoose schemas and models
require('../models/user');
require('../models/job');
require('../models/worker');
require('../models/match');
require('../models/notification');

