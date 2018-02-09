var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId; 



var Worker = mongoose.model('worker');
var Match = mongoose.model('Match');
var User = mongoose.model('User');
var Job = mongoose.model('Job');
var Notification = mongoose.model('Notification');
var botControl = require('./bot.controller')
var moment = require('moment')

// this can be used by bot to create a match when a worker applies to a job
// GET /api/matches/:employerId/:jobId/:workerId?matchStatus=invited
module.exports.createMatch = function(req, res) {
  console.log('CREATE match');
  var current_user = req.session.user;
  var employer_id = req.params.employerId;
  var job_id = req.params.jobId;
  var worker_id = req.params.workerId;
  var match_status = req.query.matchStatus;
  var carrots_used = req.query.carrots;
  var initiator_id, session_carrot_stats, updated_carrot_stats;

  if (current_user) { // if the endpoint is hit from employer CMS
    initiator_id = current_user._id;
    // update carrots
    session_carrot_stats = req.session.carrots;
    console.log(req.session.carrots)
    updated_carrot_stats = _updateCarrotStats(current_user._id, session_carrot_stats, carrots_used);
    console.log(updated_carrot_stats)
    req.session.carrots = updated_carrot_stats;
  } else {  // hit API endpoint from bot
    initiator_id = worker_id;
  }

  var newMatch = {
    initiatorId: initiator_id,
    matchStatus: match_status,
    employerId: employer_id,
    jobId: job_id
  };

  // worker
  Worker
    .findById(worker_id)
    .exec(function(err, worker){
      if (err) {
        console.log(err);
      }
      newMatch.worker = worker
      console.log('newMatch created')
      console.log(newMatch);
      // save match
      var matchQuery = { "jobId" : job_id, 'worker._id' : ObjectId(worker_id) }
      Match.findOneAndUpdate( matchQuery , newMatch , { upsert: true }).then( matchdone => {
        Match.findOne( matchQuery ).then( match => {
          console.log('TATATATTATA');
          console.log(match);
          req.session.message = 'Match created sucessfully';
              Worker.findById(worker_id).exec(async function(err, worker){
            if (err) {
              console.log(err);
              req.flash('error', err);
              return res.redirect(req.header('Referer'));
            }
            var msg;
            switch(match.matchStatus){
              case 'invited':
                msg = _getWorkerName(worker) + ' was invited to your job.';
                _addNotification(match.employerId, match.jobId, msg, '/employer/workers/'+worker_id);
                await botControl.sendInvite(job_id, worker, match._id);
                break;

              case 'applied':
                msg = _getWorkerName(worker) + ' applied to your job.';
                _addNotification(match.employerId, match.jobId, msg, '/employer/workers/'+worker_id);
                break;
              default:
                break;
            }

            // respond
            if (current_user) { // respond a redirect for employerCMS request
              // update session stats if exists
              req.session.stats.notificationsCount = req.session.stats.notificationsCount + 1;
              if (match_status == 'invited') {
                req.session.stats.invitationsCount = req.session.stats.invitationsCount + 1;
              }
              req.flash('message', 'Worker invited successfully');
              res.redirect('/employer/workers/invite/'+job_id);
            } else { // JSON response for a bot request
              var response = {
                           "messages": [
                             { "text": "Your interest to this job was stored. We will follow up with you once we hear back from the employer." }
                           ]
                         }
              res.json(response).send();
            }
          });
          console.log(match);
          console.log("Match created ", match._id);
        })
          
          
          // notification for employer
          
      }, err=>{
          console.log("Error creating match", err)
          req.session.error = 'Error creating match';
          res.render('error');
      });
    });
};


// update matchStatus of a match
// GET /api/matches/update/:matchId?matchStatus=shortlisted
module.exports.updateMatch = function(req, res) {
  console.log('UPDATE match');
  var current_user = req.session.user;
  var match_id = req.params.matchId.toString();
  var match_status = req.query.matchStatus;
  console.log(match_id)

  Match
    .findOneAndUpdate({ _id: match_id }, { matchStatus: match_status }, { upsert:true })
    .exec(function(err, match){
    if (err) {
      console.log('Error', err);
      res.redirect(req.header('Referer'));
    } else {
      // respond
      if (current_user) { // respond a redirect for employerCMS request
        // update session stats
        req.session.stats.notificationsCount = req.session.stats.notificationsCount + 1;
        req.flash('message', 'Worker '+ match_status + ' successfully');
        res.redirect(req.header('Referer'));
      } else { // JSON response for a bot request
              var response
              if( match_status == 'shortlisted'){
                 response = { "messages": [
                      { "text": "Great! We'll put you in touch with the company." }
                ]}  
              }else {
                 response = {
                      "messages": [
                            { "text": "You response was noted. We will let the company know." }
                      ]}  
              }
              
        res.json(response).send();
      }
    }
  });
};

// update employed: true for a match
// /api/matches/employed/:matchId
module.exports.employedMatch = function(req, res) {
  console.log('UPDATE match');
  var current_user = req.session.user;
  var match_id = req.params.matchId.toString();

  Match
    .findOneAndUpdate({ _id: match_id }, { employed: true }, { upsert:true })
    .exec(function(err, match){
    if (err) {
      console.log('Error', err);
      res.redirect(req.header('Referer'));
    } else {
      // respond
      req.flash('message', 'Worker employed successfully');
      res.redirect(req.header('Referer'));
    }
  });
};


// GET /api/matches/delete/:matchId
module.exports.deleteMatch = function(req, res, next) {
  var matchId = req.params.matchId;
  console.log('GET match with _id: ' + matchId);

  Match
    .findById(matchId)
    .exec(function(err, match){
      if (err) {
        console.log("Match not found: ", err)
        res.status(400).render('error');
      }
      //console.log('Found match: ', match._id);
      //remove it from db
      match.remove(function (err, match) {
        if (err) {
          console.log(err);
          res.status(400).render('error');
        } else {
          console.log('DELETE match ID: ' + match._id);
          res.format({
            html: function(){
              req.session.message = 'Invitation cancelled';
              res.redirect( '/employer/workers/invite/' + match['jobId'] );
            },
            json: function(){
              res.json({ message : 'deleted' });
            }
          });
        }
    });
  });
}

// HELPER methods
var _addNotification = function(notifiee_id, job_id, message, on_click_path) {
  console.log('CREATE notification');
  var newNotification = Notification({
    notifieeId : notifiee_id,
    jobId: job_id,
    onClickPath: on_click_path,
    message : message
  });

  newNotification.save(function(err, notification){
    if (err) {
      console.log('Error', err, notifiee_id, job_id, message);
      return err;
    }
    return notification;
  });
}

// updates carrot stats in users document of and returns updated user
var _updateCarrotStats = function(employer_id, session_carrot_stats, quantity){
  console.log('UPDATE carrot stats');
  console.log(current_stats);
  var current_stats = session_carrot_stats;
  var t, a, p, tmp_user;
  var new_stats = {};
  quantity = quantity || 2 // default carrot quantity is 2
  t = current_stats.total;
  a = current_stats.total - quantity;
  p = quantity;
  new_stats = {total: t, available: a, pending: p}

  User
    .findOneAndUpdate({ _id: employer_id }, { carrots: new_stats }, { upsert:true })
    .exec(function(err, user){
    if (err) {
      console.error('Error', err);
      return err;
    }
    console.log('Stats updated');
  });
  return new_stats;
}


module.exports.getDailyMatches = function(workerId){
    var today = moment().startOf('day');
    return Match.count({"worker._id": workerId, 'createdAt': {'$gt': today}})
}

var _getWorkerName = function(worker){
  return worker['first name'] + ' ' + worker['last name'];
}

var _getEmployerName = function(employer){
  return employer['firstName'] + ' ' + employer['lastName'];
}
