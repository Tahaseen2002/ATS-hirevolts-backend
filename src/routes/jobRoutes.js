import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  addCandidateToJob
} from '../controllers/jobController.js';

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     description: Retrieve a list of all job postings with populated candidate information
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       500:
 *         description: Server error
 */
router.get('/', getAllJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     description: Retrieve a specific job posting with full candidate details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getJobById);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create job
 *     tags: [Jobs]
 *     description: Create a new job posting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - department
 *               - location
 *               - type
 *               - description
 *               - salary
 *             properties:
 *               title:
 *                 type: string
 *                 example: Senior Software Engineer
 *               department:
 *                 type: string
 *                 example: Engineering
 *               location:
 *                 type: string
 *                 example: New York, NY
 *               type:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract]
 *                 example: Full-time
 *               status:
 *                 type: string
 *                 enum: [Open, Closed, On Hold]
 *                 example: Open
 *               description:
 *                 type: string
 *                 example: We are looking for an experienced software engineer...
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5+ years experience", "React expertise", "Team leadership"]
 *               salary:
 *                 type: string
 *                 example: $100k - $150k
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid input
 */
router.post('/', createJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update job
 *     tags: [Jobs]
 *     description: Update an existing job posting
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract]
 *               status:
 *                 type: string
 *                 enum: [Open, Closed, On Hold]
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               salary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       400:
 *         description: Invalid input
 */
router.put('/:id', updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     description: Delete a job posting
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteJob);

/**
 * @swagger
 * /api/jobs/{jobId}/candidates/{candidateId}:
 *   post:
 *     summary: Add candidate to job
 *     tags: [Jobs]
 *     description: Assign a candidate to a job posting
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate added to job successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Candidate already applied or invalid input
 *       404:
 *         description: Job or candidate not found
 *       500:
 *         description: Server error
 */
router.post('/:jobId/candidates/:candidateId', addCandidateToJob);

export default router;
