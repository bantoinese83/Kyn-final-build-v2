# 🚀 Vercel Deployment Guide

## Overview

This project is configured for deployment on Vercel with serverless API functions. **You do NOT need a separate host for your server** - everything runs on Vercel!

## 🎯 What Gets Deployed

- **Frontend**: React app built with Vite
- **Backend**: Express server converted to Vercel serverless functions
- **API Routes**: 
  - `/api/livekit/token` - LiveKit authentication
  - `/api/health` - Health check endpoint

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **Environment Variables**: Set up your API keys

## 🔧 Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
In your Vercel dashboard, add these environment variables:

```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_HOST=your_livekit_host
```

### 3. Deploy to Vercel

#### Option A: Vercel Dashboard
1. Connect your GitHub repository
2. Vercel will auto-detect the configuration
3. Set environment variables
4. Deploy!

#### Option B: Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: No
# - Project name: kyn-final-build-v2 (or your preferred name)
# - Directory: ./ (current directory)
```

### 4. Production Deployment
```bash
vercel --prod
```

## 🌐 API Endpoints

After deployment, your API will be available at:

- **LiveKit Token**: `https://your-domain.vercel.app/api/livekit/token`
- **Health Check**: `https://your-domain.vercel.app/api/health`

## 🔍 How It Works

### Before (Traditional Server)
```
Express Server (Port 3001)
├── /api/livekit/token
└── /api/health
```

### After (Vercel Serverless)
```
Vercel Platform
├── Frontend (Static Files)
└── API Functions
    ├── /api/livekit/token (Serverless)
    └── /api/health (Serverless)
```

## 💰 Cost Benefits

- **No Server Costs**: Serverless functions only charge when used
- **Auto-scaling**: Handles traffic spikes automatically
- **Global CDN**: Fast loading worldwide
- **Free Tier**: Generous free tier for development

## 🚨 Important Notes

1. **Environment Variables**: Must be set in Vercel dashboard
2. **API Limits**: Serverless functions have execution time limits
3. **Cold Starts**: First request may be slower (usually < 100ms)
4. **Database**: Supabase connection works the same way

## 🔧 Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure `build:vercel` script works locally

### API Errors
- Verify environment variables are set
- Check Vercel function logs
- Test endpoints locally first

### Performance Issues
- Monitor function execution times
- Consider upgrading Vercel plan if needed

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)

## 🎉 You're All Set!

Your full-stack application is now running on Vercel with:
- ✅ Frontend deployed
- ✅ Backend API functions
- ✅ No separate server needed
- ✅ Automatic scaling
- ✅ Global CDN
