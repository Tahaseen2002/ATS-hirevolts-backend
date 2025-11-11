import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';

// Get all jobs
export async function getAllJobs(req, res) {
  try {
    const jobs = await Job.find()
      .populate('appliedCandidates', 'name email position status')
      .sort({ postedDate: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
}

// Get job by ID
export async function getJobById(req, res) {
  try {
    const job = await Job.findById(req.params.id)
      .populate('appliedCandidates', 'name email phone position experience status skills location');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
}

// Create job
export async function createJob(req, res) {
  try {
    const jobData = {
      ...req.body,
      requirements: typeof req.body.requirements === 'string'
        ? req.body.requirements.split(',').map(r => r.trim())
        : req.body.requirements
    };

    const job = new Job(jobData);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error creating job', error: error.message });
  }
}

// Update job
export async function updateJob(req, res) {
  try {
    const updateData = { ...req.body };
    
    if (typeof updateData.requirements === 'string') {
      updateData.requirements = updateData.requirements.split(',').map(r => r.trim());
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job', error: error.message });
  }
}

// Delete job
export async function deleteJob(req, res) {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
}

// Add candidate to job
export async function addCandidateToJob(req, res) {
  try {
    const { jobId, candidateId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if candidate already applied
    if (job.appliedCandidates.includes(candidateId)) {
      return res.status(400).json({ message: 'Candidate already applied to this job' });
    }

    job.appliedCandidates.push(candidateId);
    await job.save();

    res.json({ message: 'Candidate added to job successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error adding candidate to job', error: error.message });
  }
}
