var mongoose = require('mongoose');

var notificationSchema = new mongoose.Schema({
  notifieeId : String,
  jobId: String,
  message : String,
  onClickPath: String,
  seen : { type: Boolean, default: false }
}, { timestamps: true });

mongoose.model('Notification', notificationSchema, 'notifications');
