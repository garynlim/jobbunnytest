var mongoose = require('mongoose');
var Job = mongoose.model('Job');
var moment = require('moment');
var imgur = require('imgur');

// Setting
imgur.setClientId('e019b1bcff86b7f');
imgur.setAPIUrl('https://api.imgur.com/3/');

// Getting
imgur.getClientId();

// GET /api/jobs
module.exports.newJob = function(req, res) {
  console.log('Creating new job');
  res.locals.jobProfile = req.query.profile;
  res.status(200).render('jobs/newJob', { title: 'Jobbunny | New job' });
}

// POST /api/jobs
module.exports.createJob = function(req, res) {
  console.log('Creating new job');
  var formData = req.body;
  var newJob = Job({
    jobTitle: formData.jobTitle,
    jobType: formData.jobType,
    jobIndustry: formData.jobIndustry,
    salaryType: formData.salaryType,
    salary: formData.salary,
    workPeriod: formData.workPeriod,
    startDate: formData.startDate,
    endDate: formData.endDate,
    startTime: formData.startTime,
    endTime: formData.endTime,
    totalHours: formData.totalHours,
    jobExpiration: formData.jobExpiration,
    requiredNumber: formData.requiredNumber,
    workRegion: formData.workRegion,
    location: formData.location,
    description: formData.description,
    jobRole: formData.jobRole,
    requirement: formData.requirement,
    selfEmployer: formData.selfEmployer,
    companyName: formData.companyName,
    companyWebsite: formData.companyWebsite,
    employerName: formData.employerName,
    employerEmail: formData.employerEmail,
    employerPhone: formData.employerPhone,
    employerId: formData.employerId,
    coverImage: req.file ? req.file.filename : null
  });

  newJob.save(function (err, job) {
    if (err) {
      console.log("Error creating job", err)
      req.session.error = 'Error creating job';
      res.redirect(400, '/newjob');
    } else {
      console.log("Job created ", job);
      req.session.message = 'Job created sucessfully';
      if (job.coverImage) {
        imgur.uploadFile('public/uploads/'+job.coverImage).then(function (json) {
          remote_url = json.data.link;
          console.log('here');
          console.log(remote_url);
          Job.findByIdAndUpdate(job._id, { $set: { coverImage: remote_url }}, { new: true }, function(err, job){
            if (err){
              console.log("Something wrong when updating data!");
              res.redirect(400, '/newjob');
            }
            console.log('Updated job', job);
            res.redirect( getRedirectionPath(req, job._id) );
          });
        })
        .catch(function (err) {
          console.error(err.message);
          res.redirect(400, '/newjob');
        });
      } else {
        req.flash('info', 'Job created successfully');
        res.redirect( getRedirectionPath(req, job._id) );
      }
    }
  });
}

// POST /api/jobs/update/:jobId
module.exports.updateJob = function(req, res) {
  var jobId = req.params.jobId;
  console.log('UPDATE job with _id: ' + jobId);
  var formData = req.body;
  var updateJobParams = {
    jobTitle: formData.jobTitle,
    jobType: formData.jobType,
    jobIndustry: formData.jobIndustry,
    salaryType: formData.salaryType,
    salary: formData.salary,
    workPeriod: formData.workPeriod,
    startDate: formData.startDate,
    endDate: formData.endDate,
    startTime: formData.startTime,
    endTime: formData.endTime,
    totalHours: formData.totalHours,
    jobExpiration: formData.jobExpiration,
    requiredNumber: formData.requiredNumber,
    workRegion: formData.workRegion,
    location: formData.location,
    description: formData.description,
    jobRole: formData.jobRole,
    requirement: formData.requirement,
    selfEmployer: formData.selfEmployer,
    companyName: formData.companyName,
    companyWebsite: formData.companyWebsite,
    employerName: formData.employerName,
    employerEmail: formData.employerEmail,
    employerPhone: formData.employerPhone,
    employerId: req.session.user ? req.session.user._id : null,
    coverImage: req.file ? req.file.filename : null
  };

  Job
    .findById(jobId)
    .exec(function(err, job){
      if (err) {
        console.log("Job not found: ", err)
        res.locals.error = 'Page not found';
        res.status(400).render('error');
      }
      console.log('Found job: ', job._id);
      job.set(updateJobParams);
      job.save(function (err, job) {
        if (err) {
          console.log("Error updating job", err)
          req.session.error = 'Error updating job';
          res.redirect(400, req.header('Referer'));
        } else {
          console.log("Job updated >>>>>", job);
          req.session.message = 'Job updated sucessfully';
          if (job.coverImage) {
            imgur.uploadFile('public/uploads/'+job.coverImage).then(function (json) {
              remote_url = json.data.link;
              console.log(remote_url);
              Job.findByIdAndUpdate(job._id, { $set: { coverImage: remote_url }}, { new: true }, function(err, job){
                if (err){
                  console.log("Something wrong when updating data!");
                  res.redirect(400, req.header('Referer'));
                }
                console.log('Updated job', job);
                res.redirect( getRedirectionPath(req, job._id) );
              });
            })
            .catch(function (err) {
              console.error(err.message);
              res.redirect(400, req.header('Referer'));
            });
          } else {
            req.flash('info', 'Job updated successfully');
            res.redirect( getRedirectionPath(req, job._id) );
          }
        }
      });
    });
}

// GET /jobs/:id
module.exports.showJob = function(req, res, next) {
  var jobId = req.params.jobId;
  console.log('GET job with _id: ' + jobId);

  Job
    .findById(jobId)
    .exec(function(err, job){
      if (err) {
        console.log("Job not found: ", err)
        res.locals.error = 'Page not found';
        res.status(400).render('error');
      } else {
        console.log('Found job: ', job._id);
        res.status(200).render('jobs/show', { title: 'Jobbunny | Job', job: job, moment: moment, title: 'Jobbunny | Jobs' });
      }
    });
}


module.exports.getJob = function(jobId){
   return Job.findById(jobId);
}

// GET /api/jobs/:jobId/delete
module.exports.deleteJob = function(req, res, next) {
  var jobId = req.params.jobId;
  console.log('GET job with _id: ' + jobId);

  Job
    .findById(jobId)
    .exec(function(err, job){
      if (err) {
        console.log("Job not found: ", err)
        res.status(400).render('error');
      }
      console.log('Found job: ', job._id);
      //remove it from db
      job.remove(function (err, job) {
        if (err) {
          console.log(err);
        } else {
          console.log('DELETE removing ID: ' + job._id);
          res.format({
            html: function(){
              req.flash('message', 'Job deleted successfully!')
              res.redirect( getRedirectionPath(req) );
            },
            json: function(){
              res.json({ message : 'deleted' });
            }
          });
        }
    });
  });
}

// GET /api/jobs/mark/:jobId
module.exports.markJob = function(req, res, next) {
  var jobId = req.params.jobId;
  var status = req.query.status;
  console.log('GET job with _id: ' + jobId);

  Job
    .findByIdAndUpdate(jobId, {
    $set: {
      jobStatus: status
    }
  }, function(err, job) {
    if (err) {
      console.log(err);
    } else {
      console.log('Updated successfully: ' + job._id);
      res.format({
        html: function(){
          req.flash('message', 'Job marked ['+status+'] successfully!')
          res.redirect( getRedirectionPath(req) );
        }
      });
    }
  });
}

// POST /search
module.exports.searchJob = function(req, res, next) {
  var jobQuery = req.body.query;
  console.log('searchJob with param: ' + jobQuery);

  Job
    .find( {$text: { $search: jobQuery }}, {score: { $meta: "textScore" }} )
    .exec(function(err, jobs){
      if (err || jobs.length < 1) {
        console.log("Nothing found: ", err)
        res.locals.error = 'Matching job not found for: '+ jobQuery;
        return res.status(400).render('jobs/jobsList');
      }
      res.locals.jobsCount = jobs.length;
      res.locals.query = jobQuery;
      // fix UI error, filterjobs also uses the same template
      res.locals.jobFilters = [];
      console.log('Found jobs: ', jobs);
      res.status(200).render('jobs/jobsList', {
        title: 'Jobbynny | Jobs',
        jobs: jobs,
        query: jobQuery,
        moment: moment
      });
    });
}

// GET /jobs?filter=param1&queryStr=param2
module.exports.filterJob = function(req, res, next) {
  console.log('filter JOBS ');
  var jobQuery = req.query.queryStr;
  var job_type = req.query.jobType;
  var job_industry = req.query.jobIndustry;
  var work_region = req.query.workRegion;
  var work_period = req.query.workPeriod;
  var filters = [];
  res.locals.jobType = job_type;

 Job
    .find( {$text: { $search: jobQuery }}, {score: { $meta: "textScore" }} )
    .exec(function(err, jobs){
      if (err || jobs.length < 1) {
        console.log("No match found")
        res.locals.error = 'No match found '+ jobQuery;
        res.render('jobs/jobsList');
      } else {
        console.log('Found jobs: ', jobs.length);
        res.locals.jobsType = job_type;
        var jobsList = [];
        var tmpJobsList = jobs;
        if (job_type.length > 0) {
          tmpJobsList = _filterJobs(tmpJobsList, 'jobType', job_type)
          filters.push({ jobType: job_type });
        }
        if (job_industry.length > 0) {
          tmpJobsList = _filterJobs(tmpJobsList, 'jobIndustry', job_industry)
          filters.push({ jobIndustry: job_industry });
        }
        if (work_region.length > 0) {
          tmpJobsList = _filterJobs(tmpJobsList, 'workRegion', work_region)
          filters.push({ workRegion: work_region });
        }
        if (work_period.length > 0) {
          tmpJobsList = _filterJobs(tmpJobsList, 'workPeriod', work_period)
          filters.push({ workPeriod: work_period });
        }
        res.locals.jobFilters = filters;
        res.locals.jobsCount = tmpJobsList.length;
        res.status(200).render('jobs/jobsList', {
          title: 'Jobbynny | Jobs list',
          jobs: tmpJobsList,
          query: jobQuery,
          moment: moment
        });
      }
    });
}


// helper methods
var getRedirectionPath = function(req, jobId) {
  var tmp = '/';
  if (jobId) {
    tmp = '/jobs/' + jobId;
    if (req.session.user && req.session.user.userType == 'admin') {
      tmp = '/admin/jobs/'+ jobId;
    } else if (req.session.user && req.session.user.userType == 'employer') {
      tmp = '/employer/jobs/'+ jobId;
    }
  } else {
    if (req.session.user && req.session.user.userType == 'admin') {
      tmp = '/admin/jobs';
    } else if (req.session.user && req.session.user.userType == 'employer') {
      tmp = '/employer/jobs';
    }
  }
  return tmp;
}


module.exports.getFilteredJobs = function(filters){
    console.log(JSON.stringify(filters))
    return Job.find(filters);
}

// HELPER methods
var _filterJobs = function(jobs, filter_type, filter_query) {
  var jobsList = [];
  var job;
  for (i in jobs) {
    job = jobs[i];
    job[filter_type] === filter_query && jobsList.push(job);
  }
  return jobsList;
}
