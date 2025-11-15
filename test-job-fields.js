// Test script to verify job model with new fields
import Job from './src/models/Job.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test job data with new fields
const testJobData = {
  title: 'Senior Software Engineer',
  department: 'Engineering',
  location: 'San Francisco, CA',
  type: 'Full-time',
  status: 'Open',
  description: 'We are looking for an experienced software engineer to join our team.',
  requirements: ['5+ years experience', 'React expertise', 'Node.js experience'],
  minSalary: 120000,
  maxSalary: 180000,
  client: 'Tech Innovations Inc.'
};

console.log('Testing Job model with new fields...\n');

// Create a new job with the test data
async function testJobCreation() {
  try {
    console.log('Creating job with new fields...');
    const job = new Job(testJobData);
    const savedJob = await job.save();
    
    console.log('Job created successfully:');
    console.log('ID:', savedJob._id);
    console.log('Title:', savedJob.title);
    console.log('Min Salary:', savedJob.minSalary);
    console.log('Max Salary:', savedJob.maxSalary);
    console.log('Client:', savedJob.client);
    console.log('Posted Date:', savedJob.postedDate);
    
    // Test updating the job
    console.log('\nUpdating job...');
    const updatedJob = await Job.findByIdAndUpdate(
      savedJob._id,
      { 
        maxSalary: 190000,
        client: 'Tech Innovations Corp'
      },
      { new: true }
    );
    
    console.log('Job updated successfully:');
    console.log('New Max Salary:', updatedJob.maxSalary);
    console.log('New Client:', updatedJob.client);
    
    // Clean up - delete the test job
    console.log('\nCleaning up - deleting test job...');
    await Job.findByIdAndDelete(savedJob._id);
    console.log('Test job deleted successfully');
    
    mongoose.connection.close();
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
    mongoose.connection.close();
  }
}

// Run the test
testJobCreation();