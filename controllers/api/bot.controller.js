var mongoose = require('mongoose');
//var Worker = mongoose.model('Worker');
var moment = require('moment');
var request = require('request');



var database = require('../mongo').Controller
var ctrlJobs = require('./jobs.controllers')
var ctrlMatches = require('./matches.controllers')

var BotControl = {}



const personality_traits = {
	'A' : {
		'name' : 'Driver',
		'trait' : 'The Driver is a high achiever – a mover and shaker who is definitely not averse to risk. The individual is extroverted, strong-willed, direct, practical, organised, forceful, and decisive. Look for someone who tells it the way it is and is very persuasive. Watch out or you’ll be worn down and bowled over. A driver is task- rather than relationship-oriented and wants immediate results. '
	},
	'B' : {
		'name' : 'Analytical',
		'trait' : 'The Analytical is polite but reserved, logical, fact- and task-oriented. This person’s focus is on precision and perfection. Other strengths include persistence, diligence, caution, and a systematic approach. '
	},
	'C' : {
		'name' : 'Amiable',
		'trait' : 'Devoted, consistent, dependable, and loyal, the Amiable is a hard worker and will persevere long after others have given up. He or she is a team player, cooperative and easy to get along with, trustful, sensitive and a good listener. Working in groups with cooperative individuals, the Amiable tries to avoid confrontation. He or she enjoys company, performs best in a stable environment, and often has a stabilizing effect on others. '
	},
	'D' : {
		'name' : 'Expressive',
		'trait' : 'The Expressive, a verbally adept personality, is engaging, accommodating, supportive of others, persuasive, socially adept, and relationship- rather than task-oriented. He or she loves to be one of the gang, and is always ready for something new and exciting, especially if the gang is ready to participate. Additional strengths include enthusiasm, diplomatic skills, and the ability to inspire others.  '
	}
}


BotControl.processTask= async function(req, res, task){
	console.log('request received for : ' + task)
	if('messenger user id' in req.body ){
		await BotControl.updateActivityTime(req.body['messenger user id']);
	}
	console.log(req.body);
	switch(task){
		case 'personalityExists':
			BotControl.personalityExists(req.body).then(personality_exists => {
					console.log(personality_exists)
					var response = {}
			    	if(personality_exists != null){
			    		response = {
			    						"redirect_to_blocks": ["Show jobs"]
				    				}
			    	}

			    	res.json(response)
			    },error => {
			      console.log(error);
			      res.status(500).send()
			    });
				break;


		case 'storePersonality':
			  BotControl.personalityTest(req.body).then(T => {
			    var test_result = T
			    var sharable_info = {
						  "messages":[
						  	{
								      "text" : personality_traits[test_result['primary']]['trait'] 
							},
						    {
						      "attachment":{
						        "type":"template",
						        "payload":{
						          "template_type":"generic",
						          "elements":[
						            {
						              "title":"Your personality trait is -  " + personality_traits[test_result['primary']]['name'].toUpperCase() ,
						              "image_url":"https://jobbunny.herokuapp.com/img/Jobbunny.png",
						              "subtitle": personality_traits[test_result['primary']]['trait']  ,
						              "buttons":[
						                {
							              "type": "web_url",
							              "url": "https://facebook.com/share.php?u=http://jobbunny.herokuapp.com/personality_test/"+req.body['messenger user id'],
							              "title": "Share"
							            },
						              ]
						            }
						          ]
						        }
						      }
						    }
						  ]
						}
				BotControl.experienceExists(req.body).then(T => {
					if(T == null){
						sharable_info['messages'].push({
								      "attachment": {
								        "type": "template",
								        "payload": {
								          "template_type": "button",
								          "text": "Great! Do you know you can apply to jobs that match your personality? ",
								          "buttons": [
								            {
								              "type": "show_block",
								              "block_names": ["Jobseeker Classification"],
								              "title": "I want to apply!"
								            }
								          ]
								        }
								      }
								    });
					}else{
						sharable_info["redirect_to_blocks"] =  [ "Show jobs" ]
					}
					
					res.json(sharable_info);	
				})
			    
			  }, error => {
			      console.log(error);
			      res.status(500).send()
			  });
			  break;


		  case 'register':
		  	  var registration = BotControl.register(req.body).then(T => {
			    console.log(T);
			    //res.send("OK");
			    var response = {}
			    res.json(response);
			  }, error => {
			      console.log(error);
			      res.status(500).send()
			  });
		  	break;


		  case 'profileExists':
		  	  BotControl.profileExists(req.body).then(T => {
		  	  	var response
			    if (T == null){
			    	response = {
			                     "messages": [
			                       { "text": "Your profile is not complete, please fill it so you can apply to jobs."},
			                     ],

			                     "redirect_to_blocks": [ "Create Profile" ]
			    				}
                }else{
                	response = {}
                }
			    res.json(response);
			  }, error => {
			      console.log(error);
			      res.status(500).send()
			  });
		  	break;


	  	  case 'createProfile':
		  	  BotControl.createProfile(req.body).then(T => {
			    console.log(T);
			    //res.send("OK");

			    var response = {
			                     "messages": [
			                       {"text": "Great! You profile has been created. Now you can post a job application of your interest. "}
			                     ]
			                   }
			    	res.json(response);
			  }, error => {
			      console.log(error);
			      res.status(500).send()
			  });
		  	break;

	  	  case 'createApplication':
		  	  BotControl.addApplication(req.body).then(T => {
			    console.log(T);
			    //res.send("OK");
			    var response = {
			                     "messages": [
			                       {"text": "Thank you for posting your Job Request! We will contact you via this chatbot once we find a Job that matches your requirements! Do give us a like if you like what we are doing! :). "}
			                     ]
			                   }
			    res.json(response);
			  }, error => {
			      console.log(error);
			      res.status(500).send()
			  });
		  	break;




	  	  case 'experienceExists':
		  	  BotControl.experienceExists(req.body).then(T => {
		  	  	var response
			    if (T == null){
			    	response = {
			                     "messages": [
			                       { "text": "Please add experiences relevant to your job application." },
			                     ],

			                     "redirect_to_blocks": ["Collect experience"]
			    
			    				}
                }else{
                	response = {
                		"messages": [
			                       {"text": "You have entered "+ T['experience'].length+ ' experiences in your profile.'},
			                     ],
                	}
                }
			    res.json(response);
			  }, error => {
			      console.log(error);
			      res.status(500).send()
			  });
		  	break;



		  case 'addExperience':
		  	  BotControl.addExperience(req.body).then(T => {
			    console.log(T);
			    //res.send("OK");
			    var response = {
			                     "messages": [
			                       { "text": "Your experience was stored. " }
			                     ]
			                   }
			    res.json(response);
			  }, error => {
			      console.log(error);
			      res.status(500).send()
			  });
		  	break;


		  case 'showJobs':
		      var messenger_user_id = req.body['messenger user id']
		  	  BotControl.showJobs(req.body).then(response => {
			    res.json(response);
			  }, error => {
			      console.log(error);
			      res.status(500).send()
			  });
		  	break;


	  	  case 'manualApplication' : 
	  	  		var job_id = req.body['jobId']
	  	  		var messenger_user_id = req.body['messenger user id']

	  	  		var response = {}
	  	  		console.log(messenger_user_id);

	  	  		database.getWorker(messenger_user_id).then(data => {
	  	  			console.log(data)
  	  				if(data){
  	  					ctrlJobs.getJob(job_id).then(job=> {
  	  						console.log(job)
			  	  			if(job){
		  	  					job_card = buildJobCard(job, data['_id']);

		  	  					response = { 
							    	"messages": [
									    {
									      "attachment":{
									        "type":"template",
									        "payload":{
									          "template_type":"generic",
									          "image_aspect_ratio": "square",
									          "elements": [ job_card ]
									        }
									      }
									    }
									  ]
									}
							}
			  	  			res.json(response)
			  	  		}, error=>{
			  	  			response = {
					                     "messages": [
					                       { "text": "We couldn't find a job for your input. Please enter the correct job id." },
					                     ],

					                     "redirect_to_blocks": ["Manual Job Application"]
					    
					    				}
		    				res.json(response);
			  	  		});	
  	  				}else{
  						response ={
			                     "messages": [
			                       { "text": "Your profile is not complete, please fill it so you can apply to jobs."},
			                     ],

			                     "redirect_to_blocks": [ "Create Profile" ]
			    				}
	    				res.json(response);	
  	  				}		
  				}, error=>{
  					response ={
			                     "messages": [
			                       { "text": "The request was not processed. Please try again."},
			                     ],

			                     "redirect_to_blocks": [ "Manual Job Application" ]
			    				}
	    				res.json(response);	
  				});		    
		  	break;

 		  case 'jobInvitation' : 
	  	  		var job_id = req.body['jobId']
	  	  		var messenger_user_id = req.body['messenger user id']
	  	  		var match_id = req.body['matchId']

	  	  		var response = {}
	  	  		database.getWorker(messenger_user_id).then(data => {
  	  				if(data){
  	  					ctrlJobs.getJob(job_id).then(job=> {
			  	  			if(job){
		  	  					job_card = buildInviteCard(job, data['_id'], match_id);

		  	  					response = { 
							    	"messages": [
									    {
									      "attachment":{
									        "type":"template",
									        "payload":{
									          "template_type":"generic",
									          "image_aspect_ratio": "square",
									          "elements": [ job_card ]
									        }
									      }
									    }
									  ]
									}
							}
			  	  			res.json(response)
			  	  		}, error=>{
		    				res.json(response);
			  	  		});	
  	  				}else{
	    				res.json(response);	
  	  				}		
  				}, error=>{
    				res.json(response);	
  				});		    
		  	break;

	  	case 'setNotifications':
  	  		var messenger_user_id = req.body['messenger user id']
  	  		var notifications_freq = req.body['notification_frequency']

  	  		var notfrq
  	  		switch(notifications_freq){
  	  			case 'Don\'t notify me':
  	  				notfrq = 0;
  	  				break;

  				case 'once daily':
  	  				notfrq = 1;
  	  				break;

  				case 'upto 5':
	  				notfrq = 5;
	  				break;


  				case 'keep me posted':
	  				notfrq = 9999;
	  				break;

  				default:
  					notfrq = null

  	  		}


  	  		BotControl.setNotifications(messenger_user_id, notfrq).then(T => {
				var response ={
	                     "messages": [
	                       { "text": "Your preference was stored"},
	                     ]}
				res.json(response);	
  	  		}, err=>{
  	  			res.status(500).send()
  	  		});
  			break;


		  default:
		  		res.status(500).send()
		  		break;
	}
}


var parseAvailabilityStart = function(availability_start){
	switch(availability_start){
		case 'immediately':
			return moment();
			

		case 'within a month':
			return moment().add(30, 'day');
			

		case '2 months':
			return  moment().add(60, 'day');
			

		case '3-6 months':
			return  moment().add(90, 'day');
			

		case 'after 6 months':
			return moment().add(180, 'day');

		default:
			return moment()
	}
}

var parseAvailabilityEnd = function(availability_end){
	console.log(availability_end)

	switch(availability_end){
		case 'upto a week':
			return moment();
			

		case '2 weeks':
			return moment().add(14, 'day');
			

		case '1 month':
			return  moment().add(30, 'day');
			

		case '2 months':
			return  moment().add(60, 'day');
			

		case '3-6 months':
			return  moment().add(90, 'day');
		
		case 'long term':
		default:
			return moment().add(1000, 'day');
			
	}
}


BotControl.addApplication = function(data){

	var jobType = data['jobType'];

    var job_application = {};
    

    console.log(jobType);


    switch(jobType){
        case "Part-timer":
            job_application = {
                'jobScope': data['jobScope'],
                'salaryHour': data['salaryHour'],
                'dateStart': parseAvailabilityStart(data['availability_start']).toDate(),
                'dateEnd': parseAvailabilityEnd(data['availability_end']).toDate(),
                'jobExperience': data['jobExperience'],
                //'qualifcationLevel': data['qualifcationLevel'],
                //'qualificationSubject': data['qualificationSubject'],
                //'qualificationSchool': data['qualificationSchool'],
                'preferred_location' : data['preferred_location'],
                'preferred_workdays' : data['preferred_workdays'],
                //'experience_description' : data['experience_description'],
                //'self_description' : data['self_description']
            }

            //workerData['part_time_application'] = job_application;
            break;

        case "Full-timer":
            job_application = {
                'jobScope': data['jobScope'],
                'salaryMonth': data['salaryMonth'],
                'dateStart': parseAvailabilityStart(data['availability_start']).toDate(),
                'jobExperience': data['jobExperience'],
                /*'qualificationLevel': data['qualificationLevel'],
                'qualificationSubject': data['qualificationSubject'],
                'qualificationSchool': data['qualificationSchool'],*/
                'preferred_location' : data['preferred_location'],
                //'experience_description' : data['experience_description']
                //'jobExperience' : data['jobExperience']
            }
            
            //workerData['full_time_application'] = job_application;
            break;

        /*case 'Freelancer':
            job_application = {
                'jobScope': data['jobScope'],
                'salaryMonth': data['salaryMonth'],
                'dateStart': moment(data['dateStart'], 'DD/MM/YYYY').toDate(),
                'jobExperience': data['jobExperience'],
                'qualifcationLevel': data['qualifcationLevel'],
                'qualificationSubject': data['qualificationSubject'],
                'qualificationSchool': data['qualificationSchool']
            }
            break;*/
            default:
                break;
    }

    var key = jobType+'.'+job_application['jobScope']
    var applicationData = {}
    applicationData[key] = job_application
    console.log(applicationData)

    return database.create(data['messenger user id'], applicationData);
}


BotControl.personalityTest = function(data){
	return new Promise((resolve, reject) => {
			var parse_answers = [
		                            data['personality_ans_1'],
		                            data['personality_ans_2'],
		                            data['personality_ans_3'],
		                            data['personality_ans_4'],
		                            data['personality_ans_5']
		                        ];

		    var personalities = {};
		    for (var i = parse_answers.length - 1; i >= 0; i--) {
		        if (personalities[parse_answers[i]]){
		            personalities[parse_answers[i]]++;    
		        }else{
		            personalities[parse_answers[i]] = 1; 
		        }
		    }

		    var primary_personality = Object.keys(personalities).reduce(function(a, b){ return personalities[a] > personalities[b] ? a : b });
		    delete personalities[primary_personality];

		    var secondary_personality = Object.keys(personalities).reduce(function(a, b){ return personalities[a] > personalities[b] ? a : b });
		    
		    var user_personalities = {'primary' : primary_personality, 'secondary' : secondary_personality};

		    var storable_user_personalities = {'primary' : personality_traits[primary_personality], 'secondary' : personality_traits[secondary_personality]};
		    console.log(user_personalities);

		    var messenger_user_id = data['messenger user id']
		    database.create( messenger_user_id, { 'personality' : storable_user_personalities} ).then(T => {
			    resolve(user_personalities);
			  }, error => {
			      reject(error);
			  });
	});

}


BotControl.profileExists = function(data){
	var messenger_user_id = data['messenger user id']
	return database.propertyExists(messenger_user_id, 'profile')
}

BotControl.experienceExists = function(data){
	var messenger_user_id = data['messenger user id']
	return database.propertyExists(messenger_user_id, 'experience.0')
}

BotControl.personalityExists = function(data){
	var messenger_user_id = data['messenger user id']
	return database.propertyExists(messenger_user_id, 'personality')
}


BotControl.register = function(data){
	var workerData = {
        'first name': data['first name'],
        'last name': data['last name'],
        'gender': data['gender'],
        'profilePic': data['profile pic url'],
        'messengerUserId': data['messenger user id'],
        'chatfuelUserId': data['chatfuel user id']
    }

    var messenger_user_id = workerData['messengerUserId']
    return database.create( messenger_user_id, workerData );
}

BotControl.createProfile = function(data){
	var messenger_user_id = data['messenger user id']
	var user_profile = {
			'qualificationLevel': data['profileDegree'],
			'qualificationSubject': data['profileSubject'],
			'qualificationSchool': data['profileSchool'],
			'languages' : [ data['language_1'], data['language_2'] ],
			'is_singaporean' : data['is_singaporean'] == 'Yes' ? true: false ,
			'self_description' : data['self_description'],
			'emailAddress' : data['emailAddress'],
			'handphone' : data['phoneNumber']
		}

	return database.create( messenger_user_id, { 'profile' : user_profile } );
}


BotControl.addExperience = function(data){
	var messenger_user_id = data['messenger user id']
	var experience = {
	            'company' : data['experienceCompany'],
	            'title' : data['experienceTitle'],
	            'description' : data['experienceDescription']

	    }
	return database.addExperience(messenger_user_id, experience )
}

var getPartTimeQuery = function(application){
	var query = { "jobType" : "Part-time" }

	query["jobIndustry"] = application['jobScope'] 
    query["workRegion"] = application['preferred_location'] 

    var expected_salary = application['salaryHour']
    var salary;
    switch(expected_salary){
    	case "6":
    		salary = 6
    		break;

		case "7":
    		salary = 7
    		break;

    	case "8":
    		salary = 8
    		break;

    	case "9":
    		salary = 9
    		break;

    	case "More than 10":
    		salary = 10
    		break;

		default:
			salary = 0;
			break;
    }

    query["salary"] = { "$gte" : salary }

    var startDate = moment(application['dateStart'])
    var endDate = moment(application["dateEnd"])

    if(startDate.isBefore(endDate)){
    	query["startDate"] = { "$lte" : startDate.toDate() } 
    }

    if(endDate.isAfter(startDate)){
    	query["endDate"] = { "$lte" : endDate.toDate() }
    }


    var workdays = application['preferred_workdays']
    switch(workdays){
    	case "Weekend":
    		query["workPeriod"] = "Weekend" 
    		break;

		case "Weekdays":
			query["workPeriod"] = "Weekdays" 
			break;

		case "Both":
			//no need to put this filter

		default:
			break;
    }
    //console.log(query)
    return query
}



var getFullTimeQuery = function(application){
	var query = { "jobType" : "Full-time" }
	
	query["jobIndustry"] = application['jobScope'] 
    query["workRegion"] = application['preferred_location'] 

    var expected_salary = parseInt(application['salaryMonth'])

    query["$or"] = [
    						{ "salaryType" : "Per Month", salary : {"$gte" : expected_salary } },
    						{ "salaryType" : "Per Hour", salary :{ "$gte" : expected_salary / 150 } } //assuming 150 basic hours in a month
					]

    var startDate = moment(application['dateStart']).toDate()

    query["startDate"] = { "$lte" : startDate }

    return query
}


BotControl.showJobs = function(data){
	var messenger_user_id = data['messenger user id']
	return new Promise((resolve, reject) => {
			database.getWorker(messenger_user_id).then(data => {
				//console.log(data);
				if (data == null)
					data = {}

				var part_time_applications , full_time_applications

				if("Part-timer" in data)
					part_time_applications = data["Part-timer"]

				if("Full-timer" in data)
					full_time_applications = data["Full-timer"]


				//console.log(part_timer_applications, full_time_applications)

				if(part_time_applications == null && full_time_applications == null){
					response = {
			                     "messages": [
			                       { "text": "Please apply to jobs before you can see matching jobs." },
			                     ],

			                     "redirect_to_blocks": ["Jobseeker Classification"]
			    
			    				}

				    resolve(response);
				}else{
					var clauses = []
					//create query from part time application
					if(part_time_applications != null){
						Object.keys(part_time_applications).forEach(function(key,index) {
							var application = part_time_applications[key]
							var query = getPartTimeQuery(application)
							clauses.push(query);
						});

					}

					if(full_time_applications != null){
						Object.keys(full_time_applications).forEach(function(key,index) {
							var application = full_time_applications[key]
							var query = getFullTimeQuery(application)
						    clauses.push(query);
						});
					}

					console.log(JSON.stringify(clauses))

					if(clauses.length > 0){
						ctrlJobs.getFilteredJobs({"$or" : clauses}).then(jobs => {
							if(jobs.length == 0){
								var response = {
			                     "messages": [
			                       { "text": "We couldn't find matching jobs for you at the moment. You can post another job application of your interest. " },
			                     ],

			                     "redirect_to_blocks": ["Jobseeker Classification"]
			    
			    				}
			    				resolve(response);
							}

							//console.log(jobs)
							var jobs_matched = []
							jobs.forEach(function(jobData,index){	
								console.log(jobData)		
						    	var job_card = buildJobCard(jobData, data['_id']); 
					            jobs_matched.push(job_card);
						    });

							response = { 
						    	"messages": [
								 	{"text": "You can apply to "+ jobs_matched.length +" jobs!"},
								    {
								      "attachment":{
								        "type":"template",
								        "payload":{
								          "template_type":"generic",
								          "image_aspect_ratio": "square",
								          "elements": jobs_matched
								        }
								      }
								    }
								  ]
								}
							resolve(response);
						})
					}else{
						resolve({
			                     "messages": [
			                       { "text": "We couldn't find matching jobs for you at the moment. You can post another job application of your interest. " },
			                     ],

			                     "redirect_to_blocks": ["Jobseeker Classification"]
			    
			    				});
					}
				}

			});
		});


}


BotControl.setNotifications = function(messenger_user_id, notification_freq){
	return database.create( messenger_user_id, { 'notifications_frequency' : notification_freq } );
}

var chatfuel_bot_id = '5948b2f9e4b071237743c49b'; // jobbunny bot id in chatfuel
var chatfuel_job_invite_block_id = '5a61894ae4b0b3fa51909576'; // response block in chatfuel
var chatfuel_token = 'vnbqX6cpvXUXFcOKr5RHJ7psSpHDRzO1hXBY8dkvn50ZkZyWML3YdtoCnKH7FSjC'; // jobbunny bot token in chatfuel

BotControl.sendInvite = function(job_id, worker, match_id){
	return new Promise((resolve, reject) => {
			ctrlMatches.getDailyMatches(worker['_id']).then(count => {
				if( worker['notifications_frequency'] == 0 || ( parseInt(count) > worker['notifications_frequency'] )){
					console.log('exceeded')
					resolve()
					return;

				}
				ctrlJobs.getJob(job_id).then(job=>{
				//var user_id = data['userId'];
				var messenger_user_id = worker[ 'messengerUserId' ]
				var companyName = job['companyName']
				var jobTitle = job['jobTitle']
			    console.log('messengerUserId:' + messenger_user_id);
			    var options = {
			        url: 'https://api.chatfuel.com/bots/' + chatfuel_bot_id + '/users/' + messenger_user_id + '/send?chatfuel_token=' + chatfuel_token + '&chatfuel_block_id=' + chatfuel_job_invite_block_id + 
			        '&companyName=' + companyName +
			        '&jobTitle=' + jobTitle+
			        '&jobId=' + job_id+
			        '&matchId=' + match_id,
			        headers: {
			            'Content-Type': 'application/json'
			        }
			    };
			    
			    function callback(error, response, body) {
			        if (error) {return console.log(response); reject();}
			        if (!error && response.statusCode == 200) {
			            var info = JSON.parse(body);
			            console.log(info);
			            resolve(info);
			        }
			    }

			    return request.post(options, callback);
			}, error => {
				reject();
			})
		})
		
	});
}


var buildJobCard = function(jobData, applicant_id){
	var job_card = {
		              "title": jobData["jobTitle"],
		              "image_url":"https://jobbunny.herokuapp.com/img/Jobbunny.png",
		              "subtitle":jobData["description"],
		              "buttons":[
		                {
		                  "url" : "http://jobbunny.herokuapp.com/api/matches/" + jobData['employerId'] + "/" + jobData['_id']+"/" + applicant_id + "?matchStatus=applied" ,
			              "type":"json_plugin_url",
			              "title":"Apply now!"
			            },
			            {
			              "type": "web_url",
			              "url": "https://jobbunny.herokuapp.com/jobs/"+jobData['_id'],
			              "title": "View Details"
			            },
		              ]
		            }
    return job_card;
}


var buildInviteCard = function(jobData, applicant_id, match_id){
	var job_card = {
		              "title": jobData["jobTitle"] + '@' + jobData["companyName"],
		              "image_url":"https://jobbunny.herokuapp.com/img/Jobbunny.png",
		              "subtitle":jobData["description"],
		              "buttons":[
   		                {
			              "type": "web_url",
			              "url": "https://jobbunny.herokuapp.com/jobs/"+jobData['_id'],
			              "title": "View Job Details"
			            },
		                {
		                  "url" : "http://jobbunny.herokuapp.com/api/matches/update/" + match_id + "?matchStatus=shortlisted" ,
			              "type":"json_plugin_url",
			              "title":"Accept invite!"
			            },
			            {
		                  "url" : "http://jobbunny.herokuapp.com/api/matches/update/" + match_id + "?matchStatus=declined" ,
			              "type":"json_plugin_url",
			              "title":"Not now."
			            }
		              ]
		            }
    return job_card;
}

BotControl.updateActivityTime = async function(messenger_user_id){
	return database.create( messenger_user_id, { 'lastActivity' : moment() } );
}

module.exports = BotControl;
