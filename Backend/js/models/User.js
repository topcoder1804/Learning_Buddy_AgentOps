const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserCourseSchema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  status: { type: String, enum: ['Not Started','In Progress','Completed'], default: 'Not Started' },
  startedAt: Date,
  completedAt: Date
});

const UserSchema = new Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  profession: String,
  interests:  [String],
  courses:    [UserCourseSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
