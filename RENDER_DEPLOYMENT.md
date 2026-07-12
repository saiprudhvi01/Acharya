# Render Free Tier Deployment Guide

## ⚠️ Important Warnings

This deployment configuration uses Render's Free tier with the following limitations:

1. **Database**: SQLite database stored in `/tmp` - **ALL DATA LOST on each deployment**
2. **File Uploads**: Files stored in `/tmp` - **ALL FILES LOST on each deployment**  
3. **Not suitable for production** - Only for testing/demo purposes

## Changes Made

### 1. Database Path (`src/lib/sqlite.ts`)
- Changed to use `/tmp` directory when `RENDER` environment variable is detected
- Local development still uses `data/` directory
- Auto-seeds admin user on startup (acharya@acharya.com / admin123)

### 2. File Uploads (`src/app/api/upload/route.ts`)
- Changed to use `/tmp` directory for uploads on Render
- Files won't be accessible via public URL in production
- Local development still uses `public/uploads/`

### 3. Node Version (`package.json`)
- Changed from `>=22.12.0 <23` to `>=18.0.0` for Render compatibility

### 4. Auto-seeding (`src/lib/seed.ts`)
- Automatically creates admin user on database initialization
- Email: acharya@acharya.com
- Password: admin123

## Render Deployment Settings

### Build Command
```
npm install; npm run build
```

### Start Command
```
node socket-server.js
```

### Environment Variables (Required)
Add these in Render dashboard:

```
JWT_SECRET=your-secure-random-secret-here
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your-actual-razorpay-key
RAZORPAY_KEY_SECRET=your-actual-razorpay-secret
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
PORT=3000
```

### Instance Type
- **Free** (works with limitations above)

### Advanced Settings
- No persistent disk needed (using `/tmp`)

## Post-Deployment Steps

1. **Access your app**: `https://your-app-name.onrender.com`
2. **Login as admin**: 
   - Email: acharya@acharya.com
   - Password: admin123
3. **Test functionality** - Remember data resets on each deploy

## For Production Deployment

To move to production, you'll need:

1. **Persistent Database**: Switch to PostgreSQL (Supabase, Neon, Railway Postgres)
2. **Cloud Storage**: Use Cloudinary, Vercel Blob, or AWS S3 for file uploads
3. **Paid Instance**: Upgrade to Render Starter ($7/month) for persistent disk

## Current Limitations

- ❌ No data persistence across deployments
- ❌ No file persistence across deployments  
- ❌ No reliable file serving from `/tmp`
- ❌ Not suitable for real users or production use
- ✅ Works for testing and demo purposes
- ✅ Socket.io/WebSocket connections work fine
- ✅ All app functionality works during single deployment
