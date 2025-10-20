# Kechita Intelligence Platform - Deployment Guide

## Overview

This guide covers deploying the Kechita Intelligence Platform to production using Render or Docker.

## 🚀 Quick Start

### Prerequisites
- Git repository connected to Render/Docker hosting
- API keys for:
  - OpenAI (for AI insights)
  - Twilio (for WhatsApp messaging)
  - Telegram (for Telegram bot)

---

## 📦 Deployment Options

### Option 1: Render Deployment (Recommended)

Render provides the simplest deployment with automatic builds and SSL certificates.

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Deploy Kechita Platform"
git push origin main
```

#### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up and connect your GitHub account

#### Step 3: Deploy from Dashboard
1. Click "New +" → "Blueprint"
2. Connect your repository
3. Render will read `render.yaml` and set up:
   - **Backend API** (Python/FastAPI)
   - **Frontend** (Static React site)  
   - **PostgreSQL Database**

#### Step 4: Configure Environment Variables
In the Render dashboard, add these secrets for your backend service:

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `TWILIO_ACCOUNT_SID` - Your Twilio account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio auth token
- `TWILIO_PHONE_NUMBER` - Your Twilio WhatsApp number (e.g., +1234567890)
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `TELEGRAM_CHAT_ID` - Your Telegram chat ID

**Auto-configured:**
- `DATABASE_URL` - Automatically set by Render's PostgreSQL

#### Step 5: Access Your App
- Frontend: `https://kechita-frontend.onrender.com`
- Backend API: `https://kechita-backend.onrender.com`

---

### Option 2: Docker Deployment

#### Build and Run
```bash
# Build the Docker image
docker build -t kechita-platform .

# Run with environment variables
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e OPENAI_API_KEY=your_key \
  -e TWILIO_ACCOUNT_SID=your_sid \
  -e TWILIO_AUTH_TOKEN=your_token \
  -e TWILIO_PHONE_NUMBER=+1234567890 \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e TELEGRAM_CHAT_ID=your_chat_id \
  kechita-platform
```

#### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ⚙️ Configuration via UI

After deployment, configure your API keys through the **Settings page**:

1. Navigate to the Settings tab in your deployed app
2. Enter your API credentials:
   - **OpenAI API Key** - Enables AI insights and predictions
   - **Twilio Credentials** - Enables WhatsApp messaging
   - **Telegram Credentials** - Enables Telegram bot
3. Click "Save Configuration"

**Security:** All API keys are encrypted using Fernet encryption before being stored in the `.env` file.

---

## 🔐 Security Best Practices

### Encryption Key Backup
The platform uses a `.encryption_key` file to encrypt/decrypt API keys:
- **Location:** `.encryption_key` (auto-generated on first run)
- **Permissions:** 600 (read/write for owner only)
- **Backup:** Store this file securely - without it, you cannot decrypt your API keys
- **Git:** Already added to `.gitignore` to prevent committing

### Production Checklist
- [ ] All API keys configured via Settings UI or environment variables
- [ ] `.encryption_key` backed up securely
- [ ] PostgreSQL database connected
- [ ] SSL/HTTPS enabled (automatic on Render)
- [ ] CORS configured for your domain

---

## 📊 Post-Deployment

### Initialize Database
The platform will automatically create database tables on first run. To manually initialize:

```bash
python backend/init_db.py
```

### Test API Health
```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T13:43:15.123456",
  "database": "connected"
}
```

### Upload Loan Data
Use the CSV upload feature in the app or API endpoint:
```bash
curl -X POST https://your-backend.onrender.com/api/upload-loan-data \
  -F "file=@sample_loan_data.csv"
```

---

## 🌐 Domain Setup

### Custom Domain on Render
1. Go to your service dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `platform.kechita.com`)
4. Update DNS with provided CNAME record
5. SSL certificate auto-issued by Render

---

## 📈 Monitoring

### Health Checks
- Backend: `https://your-backend.onrender.com/api/health`
- Automatic health checks configured in `render.yaml`

### Logs
- **Render Dashboard:** View real-time logs
- **Docker:** `docker-compose logs -f`

---

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render auto-deploys on push to `main` branch.

### Backup Database
```bash
# Render PostgreSQL backups are automatic
# Manual backup:
pg_dump $DATABASE_URL > backup.sql
```

---

## 🆘 Troubleshooting

### API Keys Not Working
1. Check Settings page shows "Configured" status
2. Verify `.encryption_key` exists and has correct permissions
3. Try re-entering the API key via Settings UI

### Database Connection Issues
1. Verify `DATABASE_URL` environment variable is set
2. Check database is running and accessible
3. Review connection logs in Render dashboard

### Frontend Not Loading
1. Ensure frontend service is deployed
2. Check `VITE_API_URL` points to correct backend
3. Clear browser cache and hard refresh

---

## 📞 Support

For issues or questions:
- Check logs in Render dashboard or Docker
- Review API documentation at `/docs` endpoint
- Ensure all environment variables are set correctly

---

## 🎯 Features Available

Once deployed, you'll have access to:
- **Overview Dashboard** - Real-time KPIs and branch performance
- **Analytics** - Advanced charts and performance metrics
- **Branches** - Detailed branch analysis with filtering and export
- **Messaging** - Send WhatsApp and Telegram messages
- **Settings** - Secure API key configuration
- **AI Insights** - Powered by OpenAI GPT-5
- **Data Export** - CSV reports and analytics
- **Multi-channel Messaging** - WhatsApp and Telegram integration

---

**Deployment Time:** 5-10 minutes on Render  
**Cost:** Free tier available on Render (scales as needed)  
**Uptime:** 99.9% SLA on paid Render plans
