# 🚀 Kechita Intelligence Platform - Deployment Guide

## Overview

The Kechita Intelligence Platform is production-ready with multiple deployment options: Docker, Render.com, and Replit. This guide covers all deployment methods.

---

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

1. **Clone and Configure**
```bash
git clone <your-repo-url>
cd kechita-platform
cp .env.example .env
# Edit .env with your credentials
```

2. **Build and Run**
```bash
docker-compose up --build -d
```

3. **Initialize Database**
```bash
docker-compose exec app python backend/init_db.py
```

4. **Access Application**
- Frontend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build -d

# Database backup
docker-compose exec postgres pg_dump -U kechita kechita_db > backup.sql
```

---

## ☁️ Render.com Deployment

### Prerequisites
- Render.com account
- GitHub repository

### Deployment Steps

1. **Push code to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Render**
- Go to [Render Dashboard](https://dashboard.render.com)
- Click "New +" → "Blueprint"
- Connect your GitHub repository
- Render will automatically detect `render.yaml`

3. **Configure Environment Variables**
- Navigate to your web service
- Add these secrets:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_NUMBER`
  - `TELEGRAM_BOT_TOKEN`
  - `OPENAI_API_KEY` (optional)
  - `GROQ_API_KEY` (optional)

4. **Database Setup**
- Render automatically creates PostgreSQL database
- Connection string auto-populated in `DATABASE_URL`

5. **Deploy**
- Render automatically builds and deploys
- Access via: `https://kechita-platform.onrender.com`

### Render Features
✅ **Automatic SSL/HTTPS**
✅ **Auto-scaling**
✅ **Automatic deployments on git push**
✅ **Built-in database backups**
✅ **Health check monitoring**

---

## 🔧 Replit Deployment

### Current Setup
Your app is already running on Replit!

### Publishing to Production

1. **Create PostgreSQL Database**
   - Tools → Database → Create PostgreSQL Database

2. **Initialize Database**
```bash
python backend/init_db.py
```

3. **Configure Secrets**
   - Tools → Secrets
   - Add:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_WHATSAPP_NUMBER`
     - `TELEGRAM_BOT_TOKEN`
     - `OPENAI_API_KEY` (optional)
     - `GROQ_API_KEY` (optional)

4. **Deploy**
   - Click "Deploy" button
   - Select "Autoscale" deployment
   - Your app gets a production URL!

---

## 📱 Messaging Bot Setup

### WhatsApp (Twilio)

1. **Create Twilio Account**
   - Sign up at [twilio.com](https://www.twilio.com)
   - Get free trial credits

2. **Setup WhatsApp Sandbox**
   - Console → Messaging → Try it out → Send a WhatsApp message
   - Follow sandbox activation instructions
   - Note your sandbox number (usually `whatsapp:+14155238886`)

3. **Get Credentials**
   - Account SID: Dashboard → Account Info
   - Auth Token: Dashboard → Account Info
   - WhatsApp Number: Your sandbox number

4. **Configure**
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Telegram Bot

1. **Create Bot**
   - Open Telegram, search for "@BotFather"
   - Send `/newbot`
   - Follow prompts to create bot
   - Save the bot token

2. **Get Chat ID**
   - Start conversation with your bot
   - Send a message
   - Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Find your `chat_id` in the response

3. **Configure**
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

---

## 🌐 Production Configuration

### Environment Variables

**Required:**
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**Optional (Messaging):**
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
```

**Optional (AI):**
```bash
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```

### Security Best Practices

1. **Never commit secrets to git**
   - Use `.env` files (gitignored)
   - Use platform secret managers

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups

3. **API Security**
   - Rotate API keys regularly
   - Use environment-specific keys
   - Monitor usage

---

## 📊 Monitoring & Maintenance

### Health Checks

**API Health:**
```bash
curl https://your-domain.com/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T10:00:00",
  "database": "connected"
}
```

### Logs

**Docker:**
```bash
docker-compose logs -f app
```

**Render:**
- Dashboard → Your Service → Logs

**Replit:**
- Console tab (automatic)

### Database Backups

**Docker:**
```bash
# Backup
docker-compose exec postgres pg_dump -U kechita kechita_db > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U kechita kechita_db < backup_20251020.sql
```

**Render:**
- Dashboard → Database → Backups (automatic daily backups)

---

## 🔄 Updates & Scaling

### Updating Code

**Docker:**
```bash
git pull
docker-compose up --build -d
```

**Render:**
```bash
git push origin main
# Automatic deployment triggered
```

**Replit:**
- Changes auto-deploy in development
- Click "Deploy" for production updates

### Scaling

**Render:**
- Dashboard → Service → Settings → Instance Type
- Upgrade to larger instances as needed

**Docker:**
```yaml
# docker-compose.yml
deploy:
  replicas: 3  # Run 3 instances
```

---

## 📞 API Endpoints

### Analytics
- `GET /api/summary` - Overall statistics
- `GET /api/branches` - Branch performance
- `GET /api/top-performers` - Top 3 branches
- `GET /api/ai/insights` - AI insights

### Data Management
- `POST /api/upload/csv` - Upload loan data

### Messaging
- `POST /api/messaging/whatsapp/send` - Send WhatsApp
- `POST /api/messaging/whatsapp/daily-summary` - Daily summary
- `POST /api/messaging/whatsapp/branch-performance` - Branch report
- `POST /api/messaging/whatsapp/motivational` - Motivational message
- `POST /api/messaging/whatsapp/alert` - Send alert
- `GET /api/messaging/status` - Check bot status

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL format
postgresql://username:password@host:port/database

# Test connection
psql $DATABASE_URL
```

### Bot Not Sending Messages
1. Check credentials in environment variables
2. Verify bot is configured: `GET /api/messaging/status`
3. Check API rate limits
4. Review logs for errors

### Frontend Not Loading
1. Clear browser cache (Ctrl+Shift+R)
2. Check backend is running
3. Verify CORS configuration
4. Check browser console for errors

---

## 📈 Performance Optimization

### Database
- Add indexes for frequently queried fields
- Regular VACUUM and ANALYZE
- Connection pooling

### Application
- Enable gzip compression
- Use CDN for static assets
- Cache frequently accessed data

### Monitoring
- Set up alerts for downtime
- Monitor response times
- Track error rates

---

## 🎯 Next Steps

1. ✅ Deploy to production
2. ✅ Configure messaging bots
3. ✅ Upload initial data
4. ✅ Test all endpoints
5. ✅ Set up monitoring
6. ✅ Configure backups
7. ✅ Train staff on platform use

---

## 📞 Support

For issues or questions:
- Check logs first
- Review this documentation
- Contact your technical team

**Platform Version:** 2.0
**Last Updated:** October 2025

---

*Kechita Intelligence Platform - Empowering microfinance through AI analytics* 🏦✨
