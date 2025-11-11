import Candidate from '../models/Candidate.js';
import { extractTextFromFile, parseResumeData } from '../utils/resumeParser.js';
import fs from 'fs/promises';

// Get all candidates
export async function getAllCandidates(req, res) {
  try {
    const candidates = await Candidate.find().sort({ appliedDate: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidates', error: error.message });
  }
}

// Get candidate by ID
export async function getCandidateById(req, res) {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidate', error: error.message });
  }
}

// Create candidate manually
export async function createCandidate(req, res) {
  try {
    const candidateData = {
      ...req.body,
      skills: typeof req.body.skills === 'string' 
        ? req.body.skills.split(',').map(s => s.trim()) 
        : req.body.skills
    };

    const candidate = new Candidate(candidateData);
    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ message: 'Error creating candidate', error: error.message });
  }
}

// Create candidate with resume parsing
export async function createCandidateWithResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    // Extract text from resume
    const resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
    
    // Parse resume data
    const parsedData = parseResumeData(resumeText);

    // Helper function to check if value is valid (not empty, not placeholder)
    const isValidValue = (value) => {
      return value && 
             value !== '' && 
             value !== 'string' && 
             value !== '0' && 
             typeof value !== 'undefined';
    };

    // Merge with any additional data from request body, prioritizing parsed data
    const candidateData = {
      name: isValidValue(req.body.name) ? req.body.name : (parsedData.name || 'Unknown'),
      email: isValidValue(req.body.email) ? req.body.email : parsedData.email,
      phone: isValidValue(req.body.phone) ? req.body.phone : parsedData.phone,
      position: isValidValue(req.body.position) ? req.body.position : 'Not Specified',
      experience: (req.body.experience && req.body.experience !== 0) ? req.body.experience : parsedData.experience,
      location: isValidValue(req.body.location) ? req.body.location : (parsedData.location || 'Not Specified'),
      skills: (() => {
        if (req.body.skills && req.body.skills !== 'string') {
          return typeof req.body.skills === 'string' 
            ? req.body.skills.split(',').map(s => s.trim())
            : req.body.skills;
        }
        return parsedData.skills || [];
      })(),
      status: isValidValue(req.body.status) ? req.body.status : 'New',
      resumeUrl: req.file.path,
      resumeText: resumeText,
      education: parsedData.education || req.body.education,
      summary: parsedData.summary || req.body.summary
    };

    // Validate required fields
    if (!candidateData.email) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Email is required. Could not extract from resume.' });
    }

    if (!candidateData.phone) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Phone is required. Could not extract from resume.' });
    }

    const candidate = new Candidate(candidateData);
    await candidate.save();

    res.status(201).json({
      message: 'Candidate created successfully with resume parsing',
      candidate,
      parsedData: parsedData
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(400).json({ message: 'Error processing resume', error: error.message });
  }
}

// Parse resume without saving to database (for preview/pre-fill)
export async function parseResumeOnly(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    // Extract text from resume
    const resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
    
    // Parse resume data
    const parsedData = parseResumeData(resumeText);

    // Keep the file temporarily (return the path for later use)
    const resumePath = req.file.path;

    res.status(200).json({
      message: 'Resume parsed successfully',
      parsedData: {
        name: parsedData.name || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        experience: parsedData.experience || 0,
        location: parsedData.location || '',
        skills: parsedData.skills || [],
        education: parsedData.education || '',
        summary: parsedData.summary || ''
      },
      resumePath: resumePath,
      resumeText: resumeText
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(400).json({ message: 'Error parsing resume', error: error.message });
  }
}

// Update candidate
export async function updateCandidate(req, res) {
  try {
    const updateData = { ...req.body };
    
    if (typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map(s => s.trim());
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    res.status(400).json({ message: 'Error updating candidate', error: error.message });
  }
}

// Delete candidate
export async function deleteCandidate(req, res) {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Delete resume file if exists
    if (candidate.resumeUrl) {
      try {
        await fs.unlink(candidate.resumeUrl);
      } catch (error) {
        console.error('Error deleting resume file:', error);
      }
    }

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting candidate', error: error.message });
  }
}
