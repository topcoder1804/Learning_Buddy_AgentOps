const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DataRoomSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: 'User' },
  fileUrl:   String,
  fileName:  String,
  mimeType:  String,
  course:    { type: Schema.Types.ObjectId, ref: 'Course' },
  tags:      [String]
}, { timestamps: true });

module.exports = mongoose.model('DataRoom', DataRoomSchema);
