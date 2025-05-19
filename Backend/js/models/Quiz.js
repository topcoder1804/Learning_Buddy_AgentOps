const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  question: String,
  answer:   String,
  options:  [String],
  hint:     String
});

const ScoreSchema = new Schema({
  user:  { type: Schema.Types.ObjectId, ref: 'User' },
  time:  Date,
  score: Number
});

const QuizSchema = new Schema({
  topic:     { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [QuestionSchema],
  scores:    [ScoreSchema],
  dueDate:   Date
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
