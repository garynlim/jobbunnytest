var mongoose = require('mongoose');
var Job = mongoose.model('Job');
var User = mongoose.model('User');
var Worker = require('../models/worker');
var Match = mongoose.model('Match');

var moment = require('moment');

// GET /admin
module.exports.dashboard = function (req, res, next) {
  console.log('GET admin dashboard', req.session.userId);
  Job.find({}, function(err, jobs) {
    if (err) {
      console.log(err);
    }
    Worker.find({}, function(err, workers) {
      if (err) {
        console.log(err);
      }
      User.find({}, function(err, users) {
        if (err) {
          console.log(err);
        }
        Match.find({}, function(err, matches){
          if (err) {
            console.log(err);
          }
          res.locals.totalEmployersCount = _filterUsers(users, 'employer').length;
          res.locals.totalJobsCount = jobs.length;
          res.locals.totalWorkersCount = workers.length;
          res.locals.totalInvitationsCount = matches.length;
          res.locals.totalMatchesCount = matches.length;
          res.locals.matchesStats = {
              invited: _filterMatches(matches, 'invited').length,
              applied: _filterMatches(matches, 'applied').length,
              accepted: _filterMatches(matches, 'accepted').length,
              shortlisted: _filterMatches(matches, 'shortlisted').length
            }
          res.render('admin/dashboard', {
            title: 'Jobbunny | Admin',
            error: req.flash('error'),
            message: req.flash('message')
          });
        });
      });
    });
  });
};

// GET /admin/carrots
module.exports.carrotAnalytics = function (req, res, next) {
  console.log('GET admin carrot carrotAnalytics');
  res.render('admin/carrotAnalytics', {
    title: 'Jobbunny | Admin > Carrots',
    error: req.flash('error'),
    message: req.flash('message')
  });
};

// GET /admin/bot
module.exports.botAnalytics = function (req, res, next) {
  console.log('GET admin bot botAnalytics');
  res.render('admin/botAnalytics', {
    title: 'Jobbunny | Admin > bot',
    error: req.flash('error'),
    message: req.flash('message')
  });
};


// GET /admin/settings
module.exports.settings = function (req, res, next) {
  var user_id = req.session.userId;
  console.log('GET Admin settings', user_id);

  User
    .findById(user_id)
    .exec(function(err, user){
      if (err) {
        console.log(err);
      }
      console.log('User found: ', user._id)
      res.locals.user = user;
      res.format({
        html: function(){
          res.render('admin/settings', {
            title: 'Jobbunny | Admin > Settings',
            error: req.flash('error'),
            message: req.flash('message')
          });
        }
      });
  });
};

// GET /admin/jobs
module.exports.jobsList = function (req, res, next) {
  console.log('GET Admin jobsList');
  // var job_type = req.query.jobType;
  // var job_status = req.query.jobStatus;
  Job.find({}, function(err, jobs) {
    var tmpJobsList = jobs;
    res.locals.jobsCount = tmpJobsList.length;
    res.status(200).render('admin/jobsList', {
      title: 'Jobbunny | Admin > Jobs',
      jobs: tmpJobsList,
      moment: moment,
      message: req.flash('message'),
      error: req.flash('error')
    })
  });
};

// GET /admin/jobs/:jobId
module.exports.showJob = function(req, res, next) {
  var job_id = req.params.jobId;
  var current_user = req.session.user;
  console.log('GET job with _id: ' + job_id);

  Job
    .findById(job_id)
    .exec(function(err, job){
      if (err) {
        console.log("Job not found: ", err)
        res.locals.error = 'Page not found';
        res.status(400).render('error');
      }
      // console.log('Found job: ', job._id);
      res.status(200).render('admin/showJob', {
        job: job,
        moment: moment,
        title: 'Jobbunny | Admin > Job',
        message: req.flash('message'),
        error: req.flash('error')
      });
    });
}


// GET /admin/workers
module.exports.workersList = function (req, res, next) {
  console.log('GET Admin workersList');
  var current_user = req.session.user;
  var search_query = req.query.searchQuery;
  var date_created = req.query.createdAt;
  var job_type = req.query.jobType;
  var gender = req.query.gender;
  var filters = [];

  // add filters
  date_created && filters.push({ createdAt: date_created });
  job_type && filters.push({ jobType: job_type });
  gender && filters.push({ gender: gender });

  res.locals.searchQuery = search_query;
  _searchAndSortWrokers(search_query, filters, function(err, workers){
    if (err) {
      console.log(err);
      res.redirect('/admin')
    }
    res.locals.workersCount = workers.length;
    res.locals.workerFilters = filters;
    res.status(200).render('admin/workersList', {
      title: 'Jobbunny | Admin > Workers',
      workers: workers,
      moment: moment
    });
  });
};

// GET /admin/workers/:workerId
module.exports.showWorker = function(req, res, next) {
  var workerId = req.params.workerId;
  console.log('GET worker with _id: ' + workerId);

  Worker
    .findById(workerId)
    .exec(function(err, worker){
      if (err) {
        console.log("worker not found: ", err)
        res.locals.error = 'Page not found';
        res.status(400).render('error');
      } else {
        console.log('Found worker: ', worker._id);
        res.status(200).render('admin/showWorker', {
          title: 'Jobbunny | Admin > Worker',
          worker: worker,
          message: req.flash('message'),
          error: req.flash('error')
        });
      }
    });
}

// GET /admin/employers
module.exports.employersList = function (req, res, next) {
  console.log('GET Admin employersList');
  var current_user = req.session.user;
  var search_query = req.query.searchQuery;
  var date_created = req.query.createdAt;
  var last_activity = req.query.updatedAt;
  var filters = [];

  // add filters
  date_created && filters.push({ createdAt: date_created });
  last_activity && filters.push({ updatedAt: last_activity });

  res.locals.searchQuery = search_query;
  _searchAndSortEmployers(search_query, filters, function(err, employers){
    if (err) {
      console.log(err);
      res.redirect('/admin')
    }
    var tmpEmployersList = employers;
    res.locals.employersCount = employers.length;
    res.locals.employerFilters = filters;
    res.status(200).render('admin/employersList', {
      title: 'Jobbunny | Admin > Employers',
      employers: employers,
      moment: moment
    });
  });
};

// GET /admin/employers/search
module.exports.searchEmployers = function (req, res, next) {
  var search_query = req.query.searchQuery;
  console.log('search Users with param: ' + search_query);

  User
    .find( {$text: { $search: search_query }}, { score: { $meta: "textScore" }} )
    .exec(function(err, employers){
    if (err) {
      console.log(err);
      res.redirect('/admin')
    }
    res.locals.searchQuery = search_query;
    res.locals.employersCount = employers.length;
    res.locals.employerFilters = [];
    res.status(200).render('admin/employersList', {
      title: 'Jobbunny | Admin > Employers',
      employers: employers,
      moment: moment
    });
  });
};

// GET /admin/employers/:employerId
module.exports.showEmployer = function (req, res, next) {
  var employer_id = req.params.employerId;
  console.log('GET employer with _id: ' + employer_id);

  User
    .findById(employer_id)
    .exec(function(err, employer){
      if (err) {
        console.log("employer not found: ", err)
        res.locals.error = 'Page not found';
        res.status(400).render('error');
      }
      console.log('Found employer: ', employer._id);
      Job.find({ employerId: employer_id }, function(err, jobs){
        if(err){ console.log(err) }
        res.locals.jobsCount = jobs.length
        Match.find({ employerId: employer_id, initiatorId: employer_id }, function(err, matches){
          if(err){ console.log(err) }
          res.locals.invitationsCount = matches.length;
          res.locals.shortlistedCount = _filterMatches(matches, 'shortlisted').length;
          res.status(200).render('admin/showEmployer', {
            title: 'Jobbunny | Admin > Employer',
            employer: employer,
            message: req.flash('message'),
            error: req.flash('error'),
            moment: moment
          });
        });
      });
    });
};


// HELPER methods
var _filterUsers = function(users, user_type) {
  var usersList = [];
  var user;
  for (i in users) {
    user = users[i];
    user.userType == user_type && usersList.push(user);
  }
  return usersList;
}

var _searchAndSortEmployers = function(search_query, filters, callback) {
  var error;
  var employersList;
  var sort_by = {};

  filters.forEach(function (filter){
    for(var key in filter){
      var filter_type = key;
      var filter_val = filter[key];
      console.log(filter_val);
      switch(filter_type) {
        case 'createdAt':
          if (filter_val == 'latest') {
            sort_by['createdAt'] = -1; // descending
          } else {
            sort_by['createdAt'] = 1; // ascending
          }
          break;
        case 'updatedAt':
          if (filter_val == 'recent') {
            sort_by['updatedAt'] = -1; // descending
          } else {
            sort_by['updatedAt'] = 1; // ascending
          }
          break;
        default:
          break;
      }
    }
  });

  console.log(sort_by);
  if (search_query) {
    User
      .find({ userType: 'employer', $text: { $search: search_query }}, { score: { $meta: "textScore" }}, function(err, employers){
      if (err) {
        console.log(err);
        error = err;
      }
      employersList = employers;
      callback(error, employersList);
    }).sort(sort_by);
  } else {
    User.find({ userType: 'employer' }, function(err, employers) {
      if (err) {
        console.log(err);
        error = err;
      }
      employersList = employers;
      callback(error, employersList);
    }).sort(sort_by);
  }
}

var _searchAndSortWrokers = function(search_query, filters, callback){
  var error;
  var workersList;
  var db_query_hash = {};
  var sort_by = {};

  filters.forEach(function (filter){
    for(var key in filter){
      var filter_type = key;
      var filter_val = filter[key];
      console.log(filter_val);
      if (filter_type == 'createdAt') {
        switch(filter_type) {
          case 'createdAt':
            if (filter_val == 'latest') {
              sort_by['createdAt'] = -1; // descending
            } else {
              sort_by['createdAt'] = 1; // ascending
            }
            break;
          default:
            break;
        }
      } else {
        switch(filter_type) {
          case 'jobType':
            if (filter_val == 'Part-timer') {
              db_query_hash['Part-timer'] = { $exists: true }
            } else {
              db_query_hash['Full-timer'] = { $exists: true }
            }
            break;
          default:
            db_query_hash[filter_type] = filter_val;
            break;
        }
      }
    }
  });

  // console.log(sort_by);
  // console.log(db_query_hash);
  console.log(search_query)
  if (search_query) {
    Worker
      .find({$text: { $search: search_query }}, { score: { $meta: "textScore" }}, function(err, workers){
      if (err) {
        console.log(err);
        error = err;
      }
      workersList = workers;
      callback(error, workersList);
    }).sort(sort_by);
  } else {
    Worker.find(db_query_hash, function(err, workers) {
      if (err) {
        console.log(err);
        error = err;
      }
      workersList = workers;
      callback(error, workersList);
    }).sort(sort_by);
  }
}

var _filterMatches = function(matches, match_status) {
  var matchesList = [];
  var match;
  for (i in matches) {
    match = matches[i];
    match.matchStatus == match_status && matchesList.push(match);
  }
  return matchesList;
}






