import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  stage: {
    type: String,
    enum: ['Setup', 'Learn', 'Practice'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  transcript: [{
    tutor: String,
    student: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  inputTranscript: [{
    tutor: String,
    student: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  equations: [String],
  graphingEquations: [[String]],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
sessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Session = mongoose.model('Session', sessionSchema);
export default Session; 