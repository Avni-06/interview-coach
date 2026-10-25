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
  interviewType: {
    type: String,
    enum: ['mixed', 'technical', 'behavioral', 'hr'],
    default: 'mixed',
  },
  difficulty: {
    type: String,
    enum: ['intern', 'junior', 'mid'],
    default: 'junior',
  },
  contextKind: {
    type: String,
    enum: ['jd', 'resume'],
  },
  contextText: {
    type: String,
    maxlength: 4000,
  },
  questions: [String],
  answers: [String],
  feedback: [String],
  scores: [Number],
  evaluations: [mongoose.Schema.Types.Mixed], // full AI feedback: score, good, missing, modelAnswer
  followUps: mongoose.Schema.Types.Mixed, // practice follow-ups keyed by question index: { question, answer, evaluation }
  completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);