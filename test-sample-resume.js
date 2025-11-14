// Test script for the resume parser with actual sample resume
import { parseResumeData } from './src/utils/resumeParser.js';

const sampleResumeText = `
JOHN DOE
New York, NY
john.doe@email.com
+1 (555) 123-4567

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5 years of expertise in building scalable web applications. 
Passionate about creating efficient, maintainable code and delivering exceptional user experiences.

EDUCATION
Bachelor of Science in Computer Science
State University, New York, NY
Graduated: May 2018

TECHNICAL SKILLS
JavaScript, TypeScript, React, Angular, Vue, Node.js, Express, Python, Django, Flask
MongoDB, PostgreSQL, MySQL, Redis
AWS, Docker, Kubernetes, Git, CI/CD, Jenkins
HTML, CSS, TailwindCSS, Bootstrap, Sass
REST API, GraphQL, Microservices, Agile, Scrum
Jest, Mocha, Selenium, Testing

PROFESSIONAL EXPERIENCE

Senior Software Engineer
Tech Solutions Inc., New York, NY
January 2021 - Present
• Developed and maintained full-stack applications using React and Node.js
• Implemented microservices architecture reducing system latency by 40%
• Led team of 5 developers in agile development practices
• Designed and deployed AWS infrastructure using Docker and Kubernetes

Software Engineer
Digital Innovations LLC, San Francisco, CA
June 2019 - December 2020
• Built responsive web applications using React and TypeScript
• Developed RESTful APIs with Node.js and Express
• Collaborated with cross-functional teams to deliver features on time
• Implemented automated testing reducing bugs by 30%

Junior Developer
StartupXYZ, Austin, TX
May 2018 - May 2019
• Created user interfaces using HTML, CSS, and JavaScript
• Worked with PostgreSQL databases for data management
• Participated in code reviews and sprint planning
• Learned and applied best practices in software development

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate
• MongoDB Certified Developer
`;

console.log('Testing Resume Parser with Sample Resume...\n');
console.log('Sample Resume Text:');
console.log('='.repeat(50));
console.log(sampleResumeText);
console.log('='.repeat(50));

const parsedData = parseResumeData(sampleResumeText);

console.log('\nParsed Data:');
console.log('='.repeat(50));
console.log(JSON.stringify(parsedData, null, 2));
console.log('='.repeat(50));

console.log('\nWork Experience Details:');
console.log('='.repeat(50));
parsedData.workExperience.forEach((job, index) => {
  console.log(`Job ${index + 1}:`);
  console.log(`  Position: ${job.position}`);
  console.log(`  Company: ${job.company}`);
  console.log(`  Duration: ${job.duration}`);
  console.log(`  Description:`);
  job.description.forEach((desc, i) => {
    console.log(`    ${i + 1}. ${desc}`);
  });
  console.log('');
});
console.log('='.repeat(50));

console.log('\nParsing Complete!');
console.log(`Found ${parsedData.skills.length} skills`);
console.log(`Experience: ${parsedData.experience} years`);
console.log(`Work Experience Entries: ${parsedData.workExperience.length}`);