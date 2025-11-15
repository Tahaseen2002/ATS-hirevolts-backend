import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract'],
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'On Hold'],
    default: 'Open'
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  // Replace single salary field with minSalary and maxSalary
  minSalary: {
    type: Number,
    required: false
  },
  maxSalary: {
    type: Number,
    required: false
  },
  // Add client field for company information
  client: {
    type: String,
    required: false,
    trim: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  appliedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Job', jobSchema);