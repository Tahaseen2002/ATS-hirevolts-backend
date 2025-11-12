# Cloudinary Setup Guide

## What is Cloudinary?
Cloudinary is a cloud-based service for storing and serving files (images, PDFs, documents, etc.). It's perfect for production applications where local file storage is not reliable.

## Why do we need it?
- **Render and similar platforms have ephemeral filesystems** - uploaded files are deleted when the server restarts
- **Cloudinary stores files permanently** in the cloud
- **Free tier available** - 25GB storage, 25GB bandwidth/month

## Setup Steps:

### 1. Create a Cloudinary Account
1. Go to https://cloudinary.com
2. Click "Sign Up for Free"
3. Complete the registration

### 2. Get Your Credentials
1. After logging in, go to your **Dashboard**
2. You'll see three values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Update Environment Variables

#### For Local Development:
Edit `backend/.env` file and add:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### For Render Deployment:
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add these environment variables:
   - `CLOUDINARY_CLOUD_NAME` = your-cloud-name
   - `CLOUDINARY_API_KEY` = your-api-key
   - `CLOUDINARY_API_SECRET` = your-api-secret

### 4. Install Dependencies
Run the install script:
```
backend/install-cloudinary.bat
```

Or manually:
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

### 5. Deploy to Render
After adding the environment variables to Render, redeploy your service.

## How It Works:

✅ **With Cloudinary configured:**
- Files are uploaded directly to Cloudinary
- Resume URLs are permanent Cloudinary links
- Works perfectly on Render and all cloud platforms

⚠️ **Without Cloudinary:**
- Files are saved locally (will be lost on server restart)
- Only works for local development

## Testing:

1. Upload a resume through your application
2. Check the candidate's `resumeUrl` field - it should start with `https://res.cloudinary.com/`
3. Click "View Resume" - it should open the file from Cloudinary

## Verification:

Visit your Cloudinary Dashboard:
- Go to **Media Library**
- You should see uploaded resumes in the `resumes` folder

## Troubleshooting:

**Problem:** Files still saving locally
**Solution:** Make sure all three Cloudinary environment variables are set correctly

**Problem:** "Invalid credentials" error
**Solution:** Double-check your API Key and API Secret - they should be copied exactly from Cloudinary

**Problem:** Resume parsing fails
**Solution:** The system now downloads files from Cloudinary URLs for parsing - this is normal behavior
