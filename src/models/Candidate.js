import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['New', 'Screening', 'Interview', 'Offer', 'Rejected'],
    default: 'New'
  },
  resumeUrl: {
    type: String
  },
  resumeText: {
    type: String
  },
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  education: {
    type: String
  },
  summary: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Candidate', candidateSchema);
