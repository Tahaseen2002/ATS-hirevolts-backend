// Simple test script for the resume parser
import { parseResumeData } from './src/utils/resumeParser.js';

const sampleResumeText = `
John Doe
New York, NY
john.doe@email.com
+1 234 567 8900

PROFESSIONAL SUMMARY
Experienced software engineer with 5 years of developing web applications. 
Passionate about creating scalable and maintainable solutions.

EDUCATION
Bachelor of Science in Computer Science
State University, 2018

SKILLS
JavaScript, TypeScript, React, Node.js, MongoDB, Express, AWS, Docker, 
Python, SQL, Git, Agile, REST API, GraphQL

EXPERIENCE
Senior Software Engineer - Tech Corp (2021-Present)
- Developed full-stack applications using React and Node.js
- Implemented microservices architecture

Software Engineer - StartupXYZ (2019-2021)
- Built responsive web applications
- Collaborated with cross-functional teams
`;

console.log('Testing Resume Parser...\n');
console.log('Sample Resume Text:');
console.log('='.repeat(50));
console.log(sampleResumeText);
console.log('='.repeat(50));

const parsedData = parseResumeData(sampleResumeText);

console.log('\nParsed Data:');
console.log('='.repeat(50));
console.log(JSON.stringify(parsedData, null, 2));
console.log('='.repeat(50));

console.log('\nParsing Complete!');
console.log(`Found ${parsedData.skills.length} skills`);
console.log(`Experience: ${parsedData.experience} years`);
