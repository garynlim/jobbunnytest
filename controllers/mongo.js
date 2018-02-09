var mongoose = require('mongoose');
var moment = require('moment');
var Worker = require('../models/worker');
var User = require('../models/user');
var Job = require('../models/job');
var Match = require('../models/match');
var Notification = require('../models/notification');

var Controller = {};

// set up connection to DB
var options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};
var mongodbUri = 'mongodb://gary:gary@ds131258.mlab.com:31258/jobbunny';
mongoose.connect(mongodbUri, options);
mongoose.Promise = global.Promise;
var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function () { console.log("Great success!") });


Controller.create = function (messenger_user_id, data) {
    console.log("Received data for creating entry:");
    console.log(JSON.stringify(data));

    var query = { 'messengerUserId': messenger_user_id };
    return Worker.findOneAndUpdate(query, {'$set': data}, {upsert:true});
}



Controller.addExperience = function(messenger_user_id, experience){
    var query = { 'messengerUserId': messenger_user_id };
    console.log(experience);
    return Worker.findOneAndUpdate(query, { '$push' : { 'experience': experience } });
}


Controller.propertyExists = function(messenger_user_id, property_name){
    request = {'messengerUserId': messenger_user_id }
    request[property_name] = { $exists: true}
    return Worker.findOne(request);
}


Controller.addEntry = function (data) {
    var newWorker = Worker({
        'data': JSON.stringify(data)
    });
    return newWorker.save();
}




Controller.getWorker = function(messenger_user_id){
    return Worker.findOne({ 'messengerUserId': messenger_user_id });
}

Controller.read = function () {

}

Controller.readAll = function () {
    return Worker.findById();
}

// Retrieve most recent 20 profiles
Controller.readRecent = function () {
    var numOfProfiles = 20;
    return Worker.find().sort({ $natural: -1 }).limit(numOfProfiles);
}

Controller.update = function (id, val) {
    Worker.findByIdAndUpdate(id, val, { new: true }, (err, res) => {
        if (err) console.log(err);
    });
}

Controller.delete = function () {

}

Controller.filter = function(criteria) {
    // format dates

    criteria.dateStart = moment(criteria.dateStart, 'YYYY-MM-DD').toDate();
    criteria.dateEnd = moment(criteria.dateEnd, 'YYYY-MM-DD').toDate();

    // get all employees in same jobType and jobScope
    return Worker.find({
        'jobScope': criteria.jobScope,
        'jobType': criteria.jobType,
        'dateStart': { $lte: criteria.dateStart }, // worker start date <= company start date
        'dateEnd': { $gte: criteria.dateEnd }, // worker end date >= company end date
        $or: [{ // worker salary <= company salary
            'salaryHour': { $lte: criteria.salary }
        }, {
            'salaryMonth': { $lte: criteria.salary }  
        }]
    });
}

// Controller.filter({
//     'jobType': 'Part-timer',
//     'jobScope' : 'Events',
//     'dateStart': '2017-07-28',
//     'dateEnd': '2017-07-29',
//     'salary': 100
// }).then(e => console.log(e));


module.exports = {
     Controller: Controller,
     dbUrl: mongodbUri
 };