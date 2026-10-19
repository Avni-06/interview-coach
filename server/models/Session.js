const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  questions: [String],
  answers: [String],
  feedback: [String],
  scores: [Number],
  evaluations: [mongoose.Schema.Types.Mixed], // full AI feedback: score, good, missing, modelAnswer
  completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);