'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var worker = new Schema({
    'first name': String,
    'last name': String,
    'gender': String,
    'profilePic': String,
    'messengerUserId': String,
    'chatfuelUserId': String,
    'Part-timer' : {},//new Schema({},{strict: false}),
        /*{
                'jobScope': String,
                'salaryHour': Number,
                'dateStart': Date,
                'dateEnd': Date,
                'jobExperience': String,
                'preferred_location' : String,
                'preferred_workdays' : String,
        }
    ],*/

    'Full-timer' : {},//new Schema({},{strict: false}),/*[
        /*{
                'jobScope': String,
                'salaryMonth': Number,
                'dateStart': Date,
                'jobExperience': String,
                'preferred_location' : String,
        }
    ],*/
    'personality': {
        'primary' : {},
        'secondary' : {},
    },
    'profile' : {
            'qualificationLevel': String,
            'qualificationSubject': String,
            'qualificationSchool': String,
            'languages' : [String],
            'is_singaporean' : Boolean,
            'self_description' : String,
            'emailAddress' : String,
            'handphone' : String
        },
    'experience' : [new Schema(
        {
            'company' : String,
            'title' : String,
            'description' : String

        },{ _id: false })
    ],
    'notifications_frequency': Number,
    'lastActivity' : Date

},{ timestamps: true });

worker.index({
  "first name": "text",
  "last name": "text"
});

module.exports = mongoose.model('worker', worker);