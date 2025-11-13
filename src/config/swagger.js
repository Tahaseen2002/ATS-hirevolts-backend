import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recruitment Management API',
      version: '1.0.0',
      description: 'API for managing candidates and jobs with resume parsing capabilities',
      contact: {
        name: 'API Support',
        email: 'support@recruitment.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'API Server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Local Development'
      },
      {
        url: 'https://ats-portal-hirevolts.onrender.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        Candidate: {
          type: 'object',
          required: ['name', 'email', 'phone', 'position', 'location'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated candidate ID',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Full name of the candidate',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john.doe@email.com'
            },
            phone: {
              type: 'string',
              description: 'Phone number',
              example: '+1 234 567 8900'
            },
            position: {
              type: 'string',
              description: 'Desired position',
              example: 'Software Engineer'
            },
            experience: {
              type: 'number',
              description: 'Years of experience',
              example: 5
            },
            status: {
              type: 'string',
              enum: ['New', 'Screening', 'Interview', 'Offer', 'Rejected'],
              description: 'Application status',
              example: 'New'
            },
            skills: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of skills',
              example: ['React', 'Node.js', 'MongoDB']
            },
            location: {
              type: 'string',
              description: 'Location',
              example: 'New York, NY'
            },
            resumeUrl: {
              type: 'string',
              description: 'Path to uploaded resume',
              example: '/uploads/resume-1234567890.pdf'
            },
            resumeText: {
              type: 'string',
              description: 'Extracted resume text'
            },
            education: {
              type: 'string',
              description: 'Education background',
              example: 'Bachelor of Science in Computer Science'
            },
            summary: {
              type: 'string',
              description: 'Professional summary'
            },
            appliedDate: {
              type: 'string',
              format: 'date-time',
              description: 'Application date'
            }
          }
        },
        Job: {
          type: 'object',
          required: ['title', 'department', 'location', 'type', 'description', 'salary'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated job ID',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Job title',
              example: 'Senior Software Engineer'
            },
            department: {
              type: 'string',
              description: 'Department',
              example: 'Engineering'
            },
            location: {
              type: 'string',
              description: 'Job location',
              example: 'New York, NY'
            },
            type: {
              type: 'string',
              enum: ['Full-time', 'Part-time', 'Contract'],
              description: 'Job type',
              example: 'Full-time'
            },
            status: {
              type: 'string',
              enum: ['Open', 'Closed', 'On Hold'],
              description: 'Job status',
              example: 'Open'
            },
            description: {
              type: 'string',
              description: 'Job description'
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Job requirements',
              example: ['5+ years experience', 'React expertise']
            },
            salary: {
              type: 'string',
              description: 'Salary range',
              example: '$100k - $150k'
            },
            postedDate: {
              type: 'string',
              format: 'date-time',
              description: 'Job posting date'
            },
            appliedCandidates: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of candidate IDs'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);
