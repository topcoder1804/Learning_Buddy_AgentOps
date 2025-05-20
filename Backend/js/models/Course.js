const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  type:       { type: String, enum: ['system','user'], default: 'system' },
  message:    String,
  sequenceNo: Number
});

const VideoResourceSchema = new Schema({
  videoLink: { type: String, required: true },
  transcript: { type: String, required: true }
});

const CourseSchema = new Schema({
  name:        { type: String, required: true },
  level:       { type: String, enum: ['easy','medium','hard'], default: 'easy' },
  description: String,
  tags:        [String],
  messages:    [MessageSchema],
  quizzes:     [{ quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' }, sequenceNo: Number }],
  assignments: [{ assignment: { type: Schema.Types.ObjectId, ref: 'Assignment' }, sequenceNo: Number }],
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resources:   [VideoResourceSchema]  // New field for YouTube videos and transcripts
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
