# Kechita Intelligence Platform - Setup Guide

## Overview
The Kechita Intelligence Platform is now running with sample data. Follow these steps to enable full functionality with real data and messaging integrations.

## Current Status ✅
- ✅ Frontend React dashboard (running on port 5000)
- ✅ Backend FastAPI server (running on port 8000)
- ✅ Sample data analytics working
- ✅ Database models created
- ✅ CSV upload functionality ready
- ✅ WhatsApp & Telegram bot integrations ready

## Next Steps to Complete Setup

### 1. Create PostgreSQL Database (Optional but Recommended)

**Why:** Move from sample data to real persistent data storage.

**How:**
1. In your Replit workspace, click on "Tools" in the left sidebar
2. Select "Database"
3. Click "Create PostgreSQL Database"
4. The database will be automatically configured with environment variables

**After creation, initialize the database:**
```bash
python backend/init_db.py
```

This will:
- Create all necessary tables (branches, customers, loans, collections)
- Seed sample data to get you started
- Verify the database connection

### 2. Upload Your Loan Data (Optional)

Once the database is created, you can upload your actual loan data via CSV.

**CSV Format Required:**
- `branch` - Branch name (e.g., "Nairobi Central")
- `customer_id` - Unique customer identifier
- `customer_name` - Customer full name
- `loan_id` - Unique loan identifier
- `disbursement_amount` - Loan amount disbursed
- `collection_amount` - Amount collected
- `disbursement_date` - Date loan was disbursed (optional)
- `collection_date` - Date payment was collected (optional)

**Upload via API:**
```bash
curl -X POST "http://localhost:8000/api/upload/csv" \
  -F "file=@your_data.csv"
```

Or use a tool like Postman to upload the CSV file to `/api/upload/csv`

### 3. Configure Messaging Bots (Optional)

#### WhatsApp Integration via Twilio

**What you need:**
1. Twilio Account (free trial available at https://www.twilio.com)
2. WhatsApp Sandbox enabled in Twilio Console

**Setup Steps:**
1. Sign up for Twilio at https://www.twilio.com
2. In Twilio Console, go to "Messaging" > "Try it out" > "Send a WhatsApp message"
3. Follow instructions to activate WhatsApp Sandbox
4. Get your credentials:
   - Account SID
   - Auth Token
   - WhatsApp Number (default: whatsapp:+14155238886 for sandbox)

**Add to Replit Secrets:**
1. Click on "Tools" > "Secrets" in Replit
2. Add these secrets:
   - `TWILIO_ACCOUNT_SID` = your Account SID
   - `TWILIO_AUTH_TOKEN` = your Auth Token
   - `TWILIO_WHATSAPP_NUMBER` = your WhatsApp number

**Install Twilio library:**
```bash
pip install twilio
```

#### Telegram Bot Integration

**What you need:**
1. Telegram account
2. Bot created via BotFather

**Setup Steps:**
1. Open Telegram and search for "@BotFather"
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the Bot Token provided

**Add to Replit Secrets:**
1. Click on "Tools" > "Secrets" in Replit
2. Add this secret:
   - `TELEGRAM_BOT_TOKEN` = your bot token

**Install Telegram library:**
```bash
pip install python-telegram-bot
```

### 4. Configure AI Insights (Future Enhancement)

For AI-powered insights and recommendations:

**Options:**
- OpenAI GPT API (recommended)
- Groq API (free alternative)
- Other LLM providers

**Add to Replit Secrets:**
- `OPENAI_API_KEY` = your OpenAI API key
- `GROQ_API_KEY` = your Groq API key (optional fallback)

## Testing the Platform

### Check Health
```bash
curl http://localhost:8000/api/health
```

### View Summary
```bash
curl http://localhost:8000/api/summary
```

### Check Messaging Status
```bash
curl http://localhost:8000/api/messaging/status
```

### Send Test WhatsApp Message
```bash
curl -X POST "http://localhost:8000/api/messaging/whatsapp/send" \
  -H "Content-Type: application/json" \
  -d '{"to_number": "whatsapp:+254712345678", "message": "Test message"}'
```

## API Endpoints Reference

### Analytics
- `GET /api/summary` - Overall statistics
- `GET /api/branches` - Branch performance metrics
- `GET /api/top-performers` - Top 3 performing branches
- `GET /api/ai/insights` - AI-generated insights

### Data Management
- `POST /api/upload/csv` - Upload loan data from CSV

### Messaging
- `POST /api/messaging/whatsapp/send` - Send WhatsApp message
- `POST /api/messaging/whatsapp/daily-summary` - Send daily summary via WhatsApp
- `GET /api/messaging/status` - Check bot configuration status

## Project Structure

```
kechita-platform/
├── backend/
│   ├── main.py              # Main FastAPI application
│   ├── database.py          # Database models and connection
│   ├── init_db.py           # Database initialization script
│   ├── bots/
│   │   ├── whatsapp_bot.py  # WhatsApp integration
│   │   └── telegram_bot.py  # Telegram integration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   └── src/
│       ├── App.jsx          # Main React dashboard
│       └── ...
├── start_all.sh             # Start both frontend and backend
└── SETUP_GUIDE.md           # This file
```

## Troubleshooting

### Database Issues
- **Error: "Database not configured"**
  - Solution: Create PostgreSQL database in Replit Tools > Database
  
- **Error: "No module named 'psycopg2'"**
  - Solution: Already installed via packager tool

### Bot Issues
- **WhatsApp not sending**
  - Check Twilio credentials are correct in Secrets
  - Verify WhatsApp Sandbox is activated
  - Install twilio: `pip install twilio`

- **Telegram not working**
  - Verify Bot Token is correct
  - Install python-telegram-bot: `pip install python-telegram-bot`

### Frontend Issues
- **Can't see changes**
  - Clear browser cache and hard refresh (Ctrl+Shift+R)
  - Check that workflow is running
  - Verify backend is responding at port 8000

## Support

For issues or questions:
1. Check the logs in Replit Console
2. Review error messages in the API response
3. Ensure all environment variables are set correctly

## What's Working Right Now

Even without additional setup, you can:
- ✅ View the dashboard at port 5000
- ✅ See sample analytics for 5 branches
- ✅ View AI-generated insights
- ✅ Monitor collection rates and performance
- ✅ Access all API endpoints with sample data

The platform is fully functional with sample data and ready for real data integration!
