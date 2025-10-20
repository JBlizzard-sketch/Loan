# Kechita Intelligence Platform

An AI-powered operational and analytical system for Kechita Microfinance, designed to automate daily communications, generate financial insights, and provide decision support for loan operations across 100+ branches in Kenya.

## Features

- **Real-time Analytics Dashboard**: View key metrics including disbursements, collections, arrears, and collection rates
- **AI-Powered Insights**: Get automated recommendations based on branch performance
- **Branch Performance Tracking**: Monitor individual branch metrics and identify top performers
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python FastAPI
- **Analytics**: Pandas for data processing
- **Database**: PostgreSQL (planned), MongoDB (planned)
- **Messaging**: Twilio WhatsApp API + Telegram Bot (planned)

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application with API endpoints
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main dashboard component
│   │   └── index.css       # Tailwind styles
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Node dependencies
├── start_all.sh            # Startup script for both services
└── REPLIT.md              # Progress tracking and session log

```

## API Endpoints

- `GET /` - Health check and API info
- `GET /api/health` - System health status
- `GET /api/summary` - Overall statistics across all branches
- `GET /api/branches` - Detailed branch-level metrics
- `GET /api/ai/insights` - AI-generated insights and recommendations
- `GET /api/top-performers` - Top 3 performing branches

## Running Locally

The application is configured to run automatically on Replit. Both frontend and backend start together:

- Frontend: http://localhost:5000
- Backend API: http://localhost:8000

## Next Steps

1. Integrate PostgreSQL database for persistent data storage
2. Add messaging bot layer (WhatsApp & Telegram)
3. Implement data upload functionality (CSV/Excel)
4. Add user authentication and role-based access
5. Deploy AI-powered recommendations using OpenAI/Groq APIs

## Environment Variables

See `Kechita_env_template.txt` for required environment variables.

## License

Proprietary - Kechita Microfinance
