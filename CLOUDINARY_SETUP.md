# Cloudinary Integration Setup Guide

This guide will help you set up Cloudinary as an alternative image storage solution for your Artify Digital Art Gallery.

## 🚀 Benefits of Cloudinary

- **Reliable CDN**: Global content delivery network
- **Image Optimization**: Automatic image compression and format conversion
- **Easy Integration**: Simple API with great developer experience
- **Free Tier**: Generous free tier for small to medium projects
- **No Storage Bucket Issues**: Avoids Supabase storage configuration problems

## 📋 Prerequisites

1. **Cloudinary Account**: Sign up at [https://cloudinary.com](https://cloudinary.com)
2. **Your Cloud Name**: Found in your Cloudinary dashboard
3. **Upload Preset**: Configure an unsigned upload preset

## 🔧 Step 1: Get Your Cloudinary Credentials

### 1.1 Find Your Cloud Name
1. Log into your Cloudinary dashboard
2. Your cloud name is displayed in the top-left corner or in your account settings
3. It looks like: `your-cloud-name`

### 1.2 Create an Upload Preset
1. Go to **Settings** → **Upload** in your Cloudinary dashboard
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure as follows:
   - **Name**: `artify_upload` (or any name you prefer)
   - **Signing Mode**: **Unsigned** (this allows client-side uploads)
   - **Folder**: `artify/artworks` (optional, for organization)
   - **Access Mode**: **Public** (for public artwork display)
   - **Resource Type**: **Auto** (automatically detects image/video)
   - **Allowed Formats**: `jpg,png,gif,webp` (or leave empty for all formats)
5. Save the preset

## 🔧 Step 2: Update Configuration

### 2.1 Update creator.html
Replace the placeholder values in the Cloudinary configuration section:

```javascript
// Cloudinary Configuration - Replace these with your actual credentials
const CLOUDINARY_CLOUD_NAME = 'your-actual-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = 'your-actual-upload-preset';
```

### 2.2 Update uploadCloudinary.js
Replace the default configuration:

```javascript
function getCloudinaryConfig() {
  return {
    cloudName: 'your-actual-cloud-name',  // Replace this
    uploadPreset: 'your-actual-upload-preset'  // Replace this
  };
}
```

## 🧪 Step 3: Test the Integration

### 3.1 Test with the Cloudinary Test Page
1. Navigate to: `http://localhost:8080/test-cloudinary.html`
2. Enter your Cloudinary credentials
3. Click "Save Configuration"
4. Select an image file to upload
5. Click "Upload to Cloudinary"
6. Verify the upload was successful

### 3.2 Test Database Integration
1. Click "Test Database Insert" to verify Supabase connectivity
2. Check that the artwork record is created with the Cloudinary URL

## 🔧 Step 4: Production Setup

### 4.1 Environment Variables (Recommended)
For production, use environment variables instead of hardcoded values:

```javascript
// In your server or build process
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;
```

### 4.2 Security Considerations
- **Client-side uploads**: Using unsigned presets means anyone can upload to your account
- **Rate limiting**: Monitor your Cloudinary usage to prevent abuse
- **File size limits**: Set appropriate limits in your upload preset
- **Content moderation**: Consider enabling moderation for user uploads

## 🛠 Troubleshooting

### Common Issues

#### "Upload failed: Unknown API key"
- **Solution**: Make sure your cloud name is correct (not your API key)
- Cloud name is usually your account name, not the API key

#### "Upload failed: Invalid upload preset"
- **Solution**: 
  1. Verify the preset name is spelled correctly
  2. Ensure the preset is set to "Unsigned" mode
  3. Check that the preset is active (not disabled)

#### "Network Error" or CORS issues
- **Solution**: 
  - Cloudinary automatically handles CORS for uploads
  - Check your internet connection
  - Verify the Cloudinary API URL is correct

#### Large file uploads failing
- **Solution**: 
  1. Check your upload preset file size limits
  2. Consider implementing client-side file size validation
  3. Use image compression before upload

### Debug Steps

1. **Check Browser Console**: Look for detailed error messages
2. **Verify Credentials**: Double-check your cloud name and preset
3. **Test Direct API**: Try uploading directly via Cloudinary's dashboard
4. **Network Tab**: Check the actual API request and response

## 📊 Monitoring Usage

### Cloudinary Dashboard
- Monitor your upload usage and storage
- Check bandwidth consumption
- Review transformation usage

### Implementation Features
- **Progress Tracking**: Real-time upload progress
- **Error Handling**: Detailed error messages
- **Fallback Support**: Falls back to Supabase storage if Cloudinary fails
- **Multiple Upload Methods**: Direct file or base64 data

## 🔒 Security Best Practices

1. **Use Environment Variables**: Never commit credentials to code
2. **Implement Rate Limiting**: Prevent abuse of upload functionality
3. **File Validation**: Validate file types and sizes client-side
4. **Content Moderation**: Consider implementing content filtering
5. **HTTPS Only**: Always use HTTPS in production

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)

## 🎉 Success!

Once everything is working:
1. Artwork uploads will go to Cloudinary
2. URLs will be stored in your Supabase database
3. Images will be served via Cloudinary's CDN
4. You'll get automatic image optimization

Happy uploading! 🚀