var mongoose = require('mongoose');

// matchStatus
// invited => invited by employer
// applied => applied by worker
// accepted => accepted by employer
// shortlisted => shortlisted for hiring
// employed => hired for the job
// declined => employer declined job application/worker declined job offer
var matchSchema = new mongoose.Schema({
  initiatorId: String,
  employerId: String,
  jobId: String,
  matchStatus: { type: String, default: 'invited' },
  employed: { type: Boolean, default: false },
  worker: {}
},
{ timestamps: true });

// export the schema as Match model
mongoose.model('Match', matchSchema, 'matches');
