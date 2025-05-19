const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: 'User' },
  userAnswer: String,
  score:      Number,
  time:       Date
});

const AssignmentSchema = new Schema({
  course:     { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  question:   String,
  dueDate:    Date,
  submissions:[SubmissionSchema],
  status:     { type: String, enum: ['Pending','Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
