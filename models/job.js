var mongoose = require('mongoose');

var jobSchema = new mongoose.Schema({
  jobTitle: String,
  jobType: String,
  jobIndustry: String,
  salaryType: String,
  salary: Number,
  startDate: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  totalHours: Number,
  jobExpiration: String,
  requiredNumber: { type: Number, required: true, default: 1 },
  workPeriod: String,
  workRegion: String,
  location: String,
  description: String,
  jobRole: String,
  requirement: String,
  selfEmployer: Boolean,
  companyName: String,
  companyWebsite: String,
  employerName: String,
  employerEmail: String,
  employerPhone: String,
  coverImage: String,
  featuredImages: [String],
  employerId: String,
  jobStatus: { type: String, default: 'open' },
  matches: [{}],


},
{ timestamps: true });

// index these fields for full-text search
jobSchema.index({
  jobTitle: "text",
  jobType: "text",
  jobIndustry: "text",
  salary: "text",
  jobRole : "text",
  description : "text",
  requirement : "text",
  companyName: "text",
});


// pre save hook to add employer details
jobSchema.pre('save', function (next) {
  var job = this;
  next()
});

// export the schema as Job model
mongoose.model('Job', jobSchema, 'jobs');

