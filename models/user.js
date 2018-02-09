var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const saltRounds = 10;

// email is required for registration, username is optional
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    "default" : "employer"
  },
  firstName: String,
  lastName: String,
  companyName: String,
  profilePic: String,
  carrots: {
    total: { type: Number, default: 100 },
    available: Number,
    pending: Number
  }
},
{ timestamps: true });

// hashing with bcrypt before save
userSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, saltRounds, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

// index these fields for full-text search
userSchema.index({
  firstName: "text",
  lastName: "text",
  companyName: "text"
});

userSchema.virtual('fullname').get(function() {
  return this.firstName + ' ' + this.lastName;
});

// export the schema as User model
mongoose.model('User', userSchema, 'users');
