import express from 'express';
import { upload } from '../config/multer.js';
import {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  createCandidateWithResume,
  parseResumeOnly,
  updateCandidate,
  deleteCandidate,
  viewResume
} from '../controllers/candidateController.js';

const router = express.Router();

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Candidates]
 *     description: Retrieve a list of all candidates
 *     responses:
 *       200:
 *         description: List of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllCandidates);

/**
 * @swagger
 * /api/candidates/{id}:
 *   get:
 *     summary: Get candidate by ID
 *     tags: [Candidates]
 *     description: Retrieve a specific candidate by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getCandidateById);

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create candidate manually
 *     tags: [Candidates]
 *     description: Create a new candidate with manual data entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - position
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@email.com
 *               phone:
 *                 type: string
 *                 example: +1 234 567 8900
 *               position:
 *                 type: string
 *                 example: Software Engineer
 *               experience:
 *                 type: number
 *                 example: 5
 *               location:
 *                 type: string
 *                 example: New York, NY
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "Node.js", "MongoDB"]
 *               status:
 *                 type: string
 *                 enum: [New, Screening, Interview, Offer, Rejected]
 *                 example: New
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid input
 */
router.post('/', createCandidate);

/**
 * @swagger
 * /api/candidates/upload-resume:
 *   post:
 *     summary: Upload resume and create candidate
 *     tags: [Candidates]
 *     description: Upload a resume file (PDF or DOCX) and automatically extract candidate information. Leave fields empty to use auto-parsed data.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file (PDF or DOCX, max 5MB)
 *               position:
 *                 type: string
 *                 description: Job position (if not provided, defaults to 'Not Specified')
 *                 example: Software Engineer
 *               name:
 *                 type: string
 *                 description: Override extracted name (leave empty to use parsed value)
 *               email:
 *                 type: string
 *                 description: Override extracted email (leave empty to use parsed value)
 *               phone:
 *                 type: string
 *                 description: Override extracted phone (leave empty to use parsed value)
 *               location:
 *                 type: string
 *                 description: Override extracted location (leave empty to use parsed value)
 *               experience:
 *                 type: number
 *                 description: Override extracted experience years (leave empty to use parsed value)
 *               skills:
 *                 type: string
 *                 description: Comma-separated skills to override parsed skills (leave empty to use parsed value)
 *               status:
 *                 type: string
 *                 enum: [New, Screening, Interview, Offer, Rejected]
 *                 default: New
 *     responses:
 *       201:
 *         description: Candidate created successfully with parsed resume data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidate:
 *                   $ref: '#/components/schemas/Candidate'
 *                 parsedData:
 *                   type: object
 *                   description: Data extracted from resume
 *       400:
 *         description: Invalid file or missing required data
 */
router.post('/upload-resume', upload.single('resume'), createCandidateWithResume);

/**
 * @swagger
 * /api/candidates/parse-resume:
 *   post:
 *     summary: Parse resume without saving
 *     tags: [Candidates]
 *     description: Upload and parse resume to get candidate data without saving to database (for form pre-fill)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file (PDF or DOCX, max 5MB)
 *     responses:
 *       200:
 *         description: Resume parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 parsedData:
 *                   type: object
 *                 resumePath:
 *                   type: string
 *       400:
 *         description: Invalid file or parsing error
 */
router.post('/parse-resume', upload.single('resume'), parseResumeOnly);

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Update candidate
 *     tags: [Candidates]
 *     description: Update an existing candidate's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               position:
 *                 type: string
 *               experience:
 *                 type: number
 *               location:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [New, Screening, Interview, Offer, Rejected]
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 *       400:
 *         description: Invalid input
 */
router.put('/:id', updateCandidate);

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Delete candidate
 *     tags: [Candidates]
 *     description: Delete a candidate and their associated resume file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteCandidate);

/**
 * @swagger
 * /api/candidates/{id}/view-resume:
 *   get:
 *     summary: View candidate resume inline
 *     tags: [Candidates]
 *     description: |
 *       Get candidate resume for inline viewing (no download).
 *       
 *       **Note:** This endpoint returns binary file data (PDF/DOC). 
 *       Testing in Swagger may fail - use browser or frontend instead.
 *       
 *       Example: GET http://localhost:5000/api/candidates/YOUR_CANDIDATE_ID/view-resume
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Resume file (binary)
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/msword:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Candidate or resume not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/view-resume', viewResume);

export default router;
