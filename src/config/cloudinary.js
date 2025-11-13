import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumes', // Folder name in Cloudinary
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // Important for non-image files like PDFs
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `resume-${uniqueSuffix}`;
    }
  }
});

// Helper function to convert Cloudinary URL for inline viewing
export const getInlineViewUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return cloudinaryUrl;
  }
  
  // Replace /upload/ with /upload/fl_attachment/ to force inline display
  return cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/');
};

export default cloudinary;
