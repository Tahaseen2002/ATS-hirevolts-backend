import Candidate from '../models/Candidate.js';
import { extractTextFromFile, parseResumeData } from '../utils/resumeParser.js';
import fs from 'fs/promises';
import axios from 'axios';

// Get all candidates
export async function getAllCandidates(req, res) {
  try {
    const candidates = await Candidate.find().sort({ appliedDate: -1 });
    // Add viewUrl to each candidate
    const candidatesWithViewUrl = candidates.map(candidate => {
      const candidateObj = candidate.toObject();
      if (candidateObj.resumeUrl) {
        candidateObj.viewUrl = `/api/candidates/${candidateObj._id}/view-resume`;
      }
      return candidateObj;
    });
    res.json(candidatesWithViewUrl);
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
    const candidateObj = candidate.toObject();
    if (candidateObj.resumeUrl) {
      candidateObj.viewUrl = `/api/candidates/${candidateObj._id}/view-resume`;
    }
    res.json(candidateObj);
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
        : req.body.skills,
      workExperience: req.body.workExperience || []
    };

    const candidate = new Candidate(candidateData);
    await candidate.save();
    
    const candidateObj = candidate.toObject();
    if (candidateObj.resumeUrl) {
      candidateObj.viewUrl = `/api/candidates/${candidateObj._id}/view-resume`;
    }
    res.status(201).json(candidateObj);
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

    // For Cloudinary, req.file.path is the URL; for local, it's the file path
    const isCloudinary = req.file.path.startsWith('http');
    const resumeFilePath = isCloudinary ? req.file.path : req.file.path;

    // Extract text from resume
    const resumeText = await extractTextFromFile(resumeFilePath, req.file.mimetype);
    
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
      workExperience: (() => {
        if (req.body.workExperience) {
          return typeof req.body.workExperience === 'string'
            ? JSON.parse(req.body.workExperience)
            : req.body.workExperience;
        }
        return parsedData.workExperience || [];
      })(),
      status: isValidValue(req.body.status) ? req.body.status : 'New',
      resumeUrl: isCloudinary ? req.file.path : req.file.path, // Cloudinary URL or local path
      resumeText: resumeText,
      education: parsedData.education || req.body.education,
      summary: parsedData.summary || req.body.summary
    };

    // Validate required fields
    if (!candidateData.email) {
      // Clean up uploaded file (only for local storage)
      if (!isCloudinary) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({ message: 'Email is required. Could not extract from resume.' });
    }

    if (!candidateData.phone) {
      if (!isCloudinary) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({ message: 'Phone is required. Could not extract from resume.' });
    }

    const candidate = new Candidate(candidateData);
    await candidate.save();

    // Return response with view URL for frontend
    const candidateResponse = candidate.toObject();
    // Keep original Cloudinary URL for download, but provide view endpoint
    candidateResponse.viewUrl = `/api/candidates/${candidate._id}/view-resume`;

    res.status(201).json({
      message: 'Candidate created successfully with resume parsing',
      candidate: candidateResponse,
      parsedData: parsedData
    });
  } catch (error) {
    // Clean up uploaded file on error (only for local storage)
    if (req.file && !req.file.path.startsWith('http')) {
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

    const isCloudinary = req.file.path.startsWith('http');

    // Extract text from resume
    const resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
    
    // Parse resume data
    const parsedData = parseResumeData(resumeText);

    // Keep the file path/URL
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
        workExperience: parsedData.workExperience || [],
        education: parsedData.education || '',
        summary: parsedData.summary || ''
      },
      resumePath: resumePath,
      resumeText: resumeText
    });
  } catch (error) {
    // Clean up uploaded file on error (only for local storage)
    if (req.file && !req.file.path.startsWith('http')) {
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

    const candidateObj = candidate.toObject();
    if (candidateObj.resumeUrl) {
      candidateObj.viewUrl = `/api/candidates/${candidateObj._id}/view-resume`;
    }
    res.json(candidateObj);
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

// View resume with inline display
export async function viewResume(req, res) {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (!candidate.resumeUrl) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // If it's a Cloudinary URL, fetch and serve with inline headers
    if (candidate.resumeUrl.startsWith('http')) {
      try {
        const response = await axios.get(candidate.resumeUrl, {
          responseType: 'arraybuffer'
        });

        // Determine content type from URL or default to PDF
        let contentType = 'application/pdf';
        if (candidate.resumeUrl.includes('.doc')) {
          contentType = 'application/msword';
        } else if (candidate.resumeUrl.includes('.docx')) {
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        // Set headers to display inline
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', 'inline');
        res.send(Buffer.from(response.data));
      } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ message: 'Error fetching resume from Cloudinary' });
      }
    } else {
      // Local file - serve directly
      try {
        const fileBuffer = await fs.readFile(candidate.resumeUrl);
        const contentType = candidate.resumeUrl.endsWith('.pdf') 
          ? 'application/pdf' 
          : 'application/msword';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', 'inline');
        res.send(fileBuffer);
      } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ message: 'Error reading resume file' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Error viewing resume', error: error.message });
  }
}
