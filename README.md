# Recruitment Backend API

Backend server for the recruitment management system with MongoDB integration and resume parsing capabilities.

## Features

- **MongoDB Integration**: Store candidates and jobs in MongoDB
- **Resume Parsing**: Automatically extract candidate information from PDF and DOCX resumes
- **RESTful API**: Complete CRUD operations for candidates and jobs
- **File Upload**: Handle resume uploads with multer
- **Auto-extraction**: Parse name, email, phone, skills, experience, education, and location from resumes

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   
   Update the `.env` file with your MongoDB credentials:
   ```
   MONGODB_URI=mongodb+srv://appUser:<YOUR_PASSWORD>@cluster0.fvusuhm.mongodb.net/recruitment?retryWrites=true&w=majority&appName=Cluster0
   PORT=5000
   ```

   Replace `<YOUR_PASSWORD>` with your actual MongoDB password.

3. **Start the Server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

## API Endpoints

### Candidates

- **GET** `/api/candidates` - Get all candidates
- **GET** `/api/candidates/:id` - Get candidate by ID
- **POST** `/api/candidates` - Create candidate manually
- **POST** `/api/candidates/upload-resume` - Upload resume and auto-create candidate
- **PUT** `/api/candidates/:id` - Update candidate
- **DELETE** `/api/candidates/:id` - Delete candidate

### Jobs

- **GET** `/api/jobs` - Get all jobs
- **GET** `/api/jobs/:id` - Get job by ID
- **POST** `/api/jobs` - Create job
- **PUT** `/api/jobs/:id` - Update job
- **DELETE** `/api/jobs/:id` - Delete job
- **POST** `/api/jobs/:jobId/candidates/:candidateId` - Add candidate to job

## Resume Upload

To upload a resume and auto-parse candidate information:

```bash
curl -X POST http://localhost:5000/api/candidates/upload-resume \
  -F "resume=@/path/to/resume.pdf" \
  -F "position=Software Engineer"
```

The system will automatically extract:
- Name
- Email
- Phone number
- Skills (technical keywords)
- Years of experience
- Education
- Location
- Professional summary

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── multer.js         # File upload configuration
│   ├── controllers/
│   │   ├── candidateController.js
│   │   └── jobController.js
│   ├── models/
│   │   ├── Candidate.js      # Candidate schema
│   │   └── Job.js            # Job schema
│   ├── routes/
│   │   ├── candidateRoutes.js
│   │   └── jobRoutes.js
│   ├── utils/
│   │   └── resumeParser.js   # Resume parsing logic
│   └── server.js             # Main server file
├── uploads/                   # Resume files storage
├── .env                      # Environment variables
└── package.json
```

## Resume Parsing

The resume parser supports:
- **Formats**: PDF, DOC, DOCX
- **Max file size**: 5MB
- **Extracted fields**:
  - Personal information (name, email, phone)
  - Professional details (experience years, location)
  - Skills (common technical keywords)
  - Education background
  - Professional summary

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Development

To add new features:

1. Create/update models in `src/models/`
2. Add controller logic in `src/controllers/`
3. Define routes in `src/routes/`
4. Update server.js to include new routes

## Database Schema

### Candidate
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  position: String (required),
  experience: Number,
  status: ['New', 'Screening', 'Interview', 'Offer', 'Rejected'],
  skills: [String],
  location: String,
  resumeUrl: String,
  resumeText: String,
  education: String,
  summary: String,
  appliedDate: Date
}
```

### Job
```javascript
{
  title: String (required),
  department: String (required),
  location: String (required),
  type: ['Full-time', 'Part-time', 'Contract'],
  status: ['Open', 'Closed', 'On Hold'],
  description: String,
  requirements: [String],
  salary: String,
  postedDate: Date,
  appliedCandidates: [ObjectId (ref: Candidate)]
}
```
"# ATS-hirevolts-backend" 
