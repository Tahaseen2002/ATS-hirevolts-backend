import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import https from 'https';
import http from 'http';

/**
 * Download file from URL to buffer
 */
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Extract text from PDF or DOCX files
 */
export async function extractTextFromFile(filePath, mimeType) {
  try {
    let dataBuffer;
    
    // Check if filePath is a URL (Cloudinary)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // Download file from URL
      dataBuffer = await downloadFile(filePath);
    } else {
      // Read from local file system
      dataBuffer = await fs.readFile(filePath);
    }

    if (mimeType === 'application/pdf') {
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimeType === 'application/msword') {
      // For DOCX, if it's a URL, we need to save temporarily
      if (filePath.startsWith('http')) {
        const tempPath = `/tmp/temp-resume-${Date.now()}.docx`;
        await fs.writeFile(tempPath, dataBuffer);
        const result = await mammoth.extractRawText({ path: tempPath });
        // Clean up temp file
        await fs.unlink(tempPath).catch(() => {});
        return result.value;
      } else {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      }
    }
    return '';
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

/**
 * Parse resume text to extract candidate information
 */
export function parseResumeData(text) {
  const data = {
    name: '',
    email: '',
    phone: '',
    skills: [],
    experience: 0,
    education: '',
    location: '',
    summary: ''
  };

  // Extract email
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    data.email = emailMatch[0];
  }

  // Extract phone number (various formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    data.phone = phoneMatch[0];
  }

  // Extract name (usually first line or before email)
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    // Try to find name before contact info
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      let line = lines[i].trim();
      
      // Remove job title in parentheses (e.g., "John Doe(Software Engineer)" -> "John Doe")
      line = line.replace(/\([^)]*\)/g, '').trim();
      
      if (line && 
          !emailRegex.test(line) && 
          !phoneRegex.test(line) && 
          !line.toLowerCase().includes('linkedin') &&
          !line.toLowerCase().includes('github') &&
          line.split(' ').length >= 2 && 
          line.split(' ').length <= 4 &&
          line.length < 50 &&
          line.length > 3) {
        data.name = line;
        break;
      }
    }
  }

  // Extract skills (common programming/technical skills)
  const skillsKeywords = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Scala', 'R',
    // Frontend Frameworks/Libraries
    'React', 'Angular', 'Vue', 'Next.js', 'Svelte', 'Ember', 'Backbone',
    // Backend Frameworks
    'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'Spring', 'ASP.NET', 'FastAPI', 'Laravel', 'Rails',
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'Redis', 'Firebase', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'SQL',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab', 'CircleCI', 'Travis CI',
    // Version Control & Tools
    'Git', 'GitHub', 'Bitbucket', 'SVN',
    // Styling
    'HTML', 'CSS', 'Sass', 'SCSS', 'Less', 'TailwindCSS', 'Bootstrap', 'Material-UI', 'Ant Design',
    // APIs & Architecture
    'REST API', 'GraphQL', 'gRPC', 'Microservices', 'SOAP',
    // Testing
    'Jest', 'Mocha', 'Jasmine', 'Selenium', 'Cypress', 'JUnit', 'PyTest', 'TestNG',
    // Methodologies
    'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps',
    // Project Management Tools
    'JIRA', 'Confluence', 'Trello', 'Asana',
    // Build Tools
    'Webpack', 'Vite', 'Babel', 'Gulp', 'Grunt', 'Rollup',
    // State Management
    'Redux', 'MobX', 'Zustand', 'Recoil',
    // Mobile
    'React Native', 'Flutter', 'Ionic', 'Xamarin',
    // Data Science/ML
    'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy',
    // Design Tools
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
    // API Testing
    'Postman', 'Insomnia', 'Swagger',
    // Visualization
    'Chart.js', 'Recharts', 'D3.js', 'Highcharts',
    // CMS
    'WordPress', 'Drupal', 'Contentful', 'Strapi',
    // Authentication & Security
    'JWT', 'OAuth', 'RBAC',
    // ORM
    'Mongoose', 'Sequelize', 'TypeORM',
    // Other
    'ETL', 'Data Warehousing', 'Big Data', 'Hadoop', 'Spark', 'VS Code', 'DTO'
  ];
  
  // Normalize skill names (handle variations)
  const skillNormalizations = {
    'react.js': 'React',
    'reactjs': 'React',
    'vue.js': 'Vue',
    'vuejs': 'Vue',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'html5': 'HTML',
    'css3': 'CSS',
    'javascript (es6+)': 'JavaScript',
    'es6': 'JavaScript',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    'js': 'JavaScript',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mongo': 'MongoDB',
    'react native': 'React Native',
    'express.js': 'Express',
    'expressjs': 'Express',
    'restful api': 'REST API',
    'rest': 'REST API',
    'rest apis': 'REST API',
    'jwt auth': 'JWT',
    'vs code': 'VS Code',
    'dto validation': 'DTO',
    'agile/scrum': 'Agile'
  };
  
  const textLower = text.toLowerCase();
  const foundSkills = new Set(); // Use Set to avoid duplicates
  
  // Step 1: Look for dedicated Skills section first
  const skillsSectionKeywords = ['skills', 'technical skills', 'professional skills', 'core competencies', 'technologies', 'expertise'];
  let skillsSectionText = '';
  
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase().trim();
    
    // Check if this line is a skills section header
    if (skillsSectionKeywords.some(keyword => 
      lineLower === keyword || 
      lineLower === keyword + ':' ||
      lineLower.startsWith(keyword + ':') ||
      (lineLower.length < 30 && lineLower.includes(keyword))
    )) {
      // Found skills section - extract next 3-10 lines until next section
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j].trim();
        
        // Stop if we hit another section header (all caps or contains common headers)
        const sectionHeaders = ['experience', 'education', 'work history', 'employment', 'projects', 'certifications'];
        const isNextSection = sectionHeaders.some(header => 
          nextLine.toLowerCase().startsWith(header) ||
          (nextLine === nextLine.toUpperCase() && nextLine.length > 3 && nextLine.length < 30)
        );
        
        if (isNextSection) break;
        
        skillsSectionText += ' ' + nextLine;
      }
      break; // Found skills section, no need to continue
    }
  }
  
  // Step 2: Extract skills from dedicated skills section if found
  if (skillsSectionText.length > 10) {
    const skillsSectionLower = skillsSectionText.toLowerCase();
    
    skillsKeywords.forEach(skill => {
      const skillLower = skill.toLowerCase();
      const escapedSkill = skillLower.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      
      if (regex.test(skillsSectionLower)) {
        foundSkills.add(skill);
      }
    });
    
    // Also check for common variations in the skills section
    Object.entries(skillNormalizations).forEach(([variant, normalized]) => {
      const escapedVariant = variant.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedVariant}\\b`, 'i');
      
      if (regex.test(skillsSectionLower)) {
        foundSkills.add(normalized);
      }
    });
  }
  
  // Step 3: Only use fallback if NO skills section found (not based on count)
  if (skillsSectionText.length === 0) {
    skillsKeywords.forEach(skill => {
      const skillLower = skill.toLowerCase();
      const escapedSkill = skillLower.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      
      if (regex.test(textLower)) {
        foundSkills.add(skill);
      }
    });
  }
  
  // Remove redundant skills (e.g., if both "React" and "React.js" found, keep only "React")
  const skillsArray = Array.from(foundSkills);
  const filteredSkills = skillsArray.filter(skill => {
    // Check if this skill is a subset of another skill
    const isRedundant = skillsArray.some(otherSkill => 
      otherSkill !== skill && 
      otherSkill.toLowerCase().includes(skill.toLowerCase()) &&
      skill.length < otherSkill.length
    );
    return !isRedundant;
  });
  
  // Sort skills alphabetically for consistency
  data.skills = filteredSkills.sort();

  // Extract experience (look for years of experience)
  const expPatterns = [
    /(\d+\.\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/i,  // 2.5+ years
    /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/i        // 5 years
  ];
  
  for (const pattern of expPatterns) {
    const expMatch = text.match(pattern);
    if (expMatch) {
      data.experience = parseFloat(expMatch[1]);
      break;
    }
  }

  // Extract education
  const educationKeywords = ['bachelor', 'master', 'phd', 'b.s.', 'm.s.', 'b.tech', 'm.tech', 'mba', 'degree'];
  const educationLines = lines.filter(line => 
    educationKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );
  if (educationLines.length > 0) {
    data.education = educationLines[0];
  }

  // Extract location (look for city, state/country patterns)
  // Priority: Look in first 10 lines (usually near contact info)
  const locationPatterns = [
    // US/Canada: City, ST (e.g., "New York, NY", "Toronto, ON")
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})(?:\s|\||$|\d)/,
    // India: City- PIN (e.g., "Ongole- 523316", "Mumbai - 400001")
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[-–—]\s*(\d{6})/,
    // General: City, Country (e.g., "London, UK", "Paris, France")
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)(?:\s|\||$)/,
    // International: City, State/Province, Country
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+),\s*([A-Z][a-z]+)/,
  ];
  
  // False positive keywords to avoid
  const locationExclusions = [
    'university', 'college', 'institute', 'school',
    'vercel', 'github', 'linkedin', 'deployed', 'live',
    'bachelor', 'master', 'degree', 'certification',
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
    'experience', 'summary', 'skills', 'education', 'work',
    'project', 'stack', 'tech', 'tools',
    // Common resume words that shouldn't be locations
    'deployment', 'enhancement', 'maintenance', 'development',
    'implementation', 'migration', 'testing', 'analysis', 'design',
    'production', 'environment', 'solution', 'process'
  ];
  
  // Try first 5 lines ONLY (contact header) - most reliable
  const contactHeader = lines.slice(0, 5).join('\n');
  
  // List of known cities/states to help validate (partial list)
  const knownLocations = [
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
    'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
    'austin', 'jacksonville', 'san francisco', 'columbus', 'indianapolis',
    'seattle', 'denver', 'boston', 'portland', 'detroit', 'miami',
    'atlanta', 'nashville', 'baltimore', 'milwaukee', 'albuquerque',
    'toronto', 'vancouver', 'montreal', 'calgary',
    'london', 'paris', 'berlin', 'madrid', 'rome',
    'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai',
    'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow'
  ];
  
  // First pass: Search in contact header only (first 5 lines)
  for (const pattern of locationPatterns) {
    const matches = contactHeader.match(pattern);
    if (matches) {
      const matched = matches[0].trim();
      const matchedLower = matched.toLowerCase();
      
      // Check if it's a false positive
      const isFalsePositive = locationExclusions.some(exclusion => 
        matchedLower.includes(exclusion)
      );
      
      // Additional validation: length should be reasonable (5-50 chars)
      const isValidLength = matched.length >= 5 && matched.length <= 50;
      
      // Check if it has location indicators (comma, dash, or postal code)
      const hasLocationIndicator = matched.includes(',') || matched.includes('-') || /\d{5,6}/.test(matched);
      
      if (!isFalsePositive && isValidLength && hasLocationIndicator) {
        data.location = matched;
        break;
      }
    }
  }
  
  // Second pass: If not found in header, search lines 6-15 with stricter validation
  if (!data.location) {
    const extendedLines = lines.slice(5, 15).join('\n');
    
    for (const pattern of locationPatterns) {
      const matches = extendedLines.match(pattern);
      if (matches) {
        const matched = matches[0].trim();
        const matchedLower = matched.toLowerCase();
        
        // Check if it's a false positive
        const isFalsePositive = locationExclusions.some(exclusion => 
          matchedLower.includes(exclusion)
        );
        
        // Additional validation
        const isValidLength = matched.length >= 5 && matched.length <= 50;
        const hasLocationIndicator = matched.includes(',') || matched.includes('-') || /\d{5,6}/.test(matched);
        
        // REQUIRE known location for extended search area
        const hasKnownLocation = knownLocations.some(city => matchedLower.includes(city));
        
        if (!isFalsePositive && isValidLength && hasLocationIndicator && hasKnownLocation) {
          data.location = matched;
          break;
        }
      }
    }
  }
  
  // Fallback: If no location found, look for email/phone line pattern
  // Sometimes location appears on same line as contact: "email | phone | Location, ST"
  if (!data.location) {
    const contactLinePattern = /[\w.-]+@[\w.-]+\.[\w]+.*?\|.*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})/;
    const contactMatch = text.match(contactLinePattern);
    if (contactMatch && contactMatch[1]) {
      data.location = contactMatch[1].trim();
    }
  }
  
  // Fallback 2: Look for location after name line
  // Some resumes have: Name\nCity, State\nemail | phone
  if (!data.location && lines.length > 1) {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Check if line looks like "City, ST" format (short, has comma, capitalized)
      if (line.length < 50 && line.includes(',')) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length === 2 && parts[1].length === 2 && /^[A-Z]{2}$/.test(parts[1])) {
          data.location = line.trim();
          break;
        }
      }
    }
  }

  // Extract summary/objective (first paragraph after name)
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (summaryKeywords.some(keyword => lines[i].toLowerCase().includes(keyword))) {
      const summaryLines = [];
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim() && lines[j].length > 20) {
          summaryLines.push(lines[j].trim());
        }
      }
      if (summaryLines.length > 0) {
        data.summary = summaryLines.join(' ').substring(0, 500);
        break;
      }
    }
  }

  return data;
}
