# Kechita Intelligence Platform

## Overview

The Kechita Intelligence Platform (KIP) is an advanced AI-powered operational and analytical system designed for Kechita Microfinance, a microfinance institution operating 100+ branches across Kenya. The platform automates daily communications, generates financial insights, and provides decision support for loan operations. It combines interactive real-time analytics dashboards with advanced AI-driven predictions, risk analysis, and recommendations to help staff and management track disbursements, collections, arrears, and customer engagement across all branches.

The system features a modern tabbed interface with comprehensive data visualizations, filtering capabilities, CSV export functionality, and real AI integration using OpenAI's GPT-5 model for advanced insights generation.

**Recent Major Updates (October 20, 2025):**
- ✅ **Kechita Branding Integration** - Full brand identity with logo, colors (#0099CC blue, #8DC63F green), and tagline "Your Growth our pride"
- ✅ **100+ Realistic Kenyan Branches** - Enhanced data generator with authentic county names, regions, and customer data
- ✅ **XGBoost Credit Scoring System** - AI-powered credit risk assessment with 15+ features and grade-based recommendations
- ✅ **4 New Dedicated Pages**:
  - **Customers Page** - Complete customer management with search, filtering, and export
  - **Loans Page** - Comprehensive loan portfolio with status tracking and multi-filter search
  - **Credit Scoring Page** - Interactive credit analysis with risk categorization and loan recommendations
  - **Reports Page** - Advanced portfolio analytics with charts and KPI tracking
- ✅ **Enhanced Sample Data** - Generated 10,000+ loans, 5,000+ customers across 100 branches with realistic payment behaviors
- ✅ **Advanced API Endpoints** - 7 new endpoints for customers, loans, credit scoring, and portfolio analysis
- ✅ **Interactive Dashboards** - Recharts visualizations including pie charts, bar charts, and trend analysis
- ✅ **Brand-Consistent UI** - All pages styled with Kechita colors and modern gradient designs
- ✅ **Export Functionality** - CSV export on Customers, Loans, and Branches pages
- ✅ **React Router Navigation** - Full SPA with routing for 9 comprehensive pages
- ✅ **Settings Page** - Secure UI for managing API keys (OpenAI, Twilio, Telegram) with Fernet encryption
- ✅ **Enhanced UI/UX** - Beautiful gradient designs, improved typography, smooth transitions, and loading states
- ✅ **Messaging Page** - Full WhatsApp and Telegram bot controls with status indicators
- ✅ **Advanced Analytics** - Enhanced charts, performance metrics, and risk indicators
- ✅ **Secure Settings API** - Backend endpoints with encrypted storage for sensitive credentials
- ✅ **Production Ready** - Updated Render and Docker deployment configurations
- ✅ **OpenAI GPT-5 integration** for AI-powered insights, predictions, and risk analysis
- ✅ **Modern Lucide React icons** throughout the UI

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React 19.1.1 + Vite 7.1.7 + Tailwind CSS 4.1.14

**Design Pattern**: Single-page application with component-based architecture

The frontend serves as an admin dashboard for analytics and message review. It uses Vite as the build tool for fast hot module replacement during development. Tailwind CSS provides utility-first styling for rapid UI development. The application is configured to run on port 5000 and proxies API requests to the backend on port 8000.

**Rationale**: React with Vite provides a modern, fast development experience with minimal configuration. Tailwind CSS enables rapid prototyping of responsive interfaces without writing custom CSS. This stack is lightweight and suitable for the dashboard's analytics-focused use case.

### Backend Architecture

**Technology Stack**: Python FastAPI + Pandas + NumPy

**Design Pattern**: RESTful API with CORS-enabled endpoints

The backend is built with FastAPI, providing high-performance asynchronous API endpoints. Currently implements sample data endpoints for branch metrics, health checks, and analytics. The system uses Pandas for data processing and transformation, particularly for calculating collection rates and aggregating branch-level statistics.

**Current Endpoints**:
- Health monitoring and status checks
- Branch-level metrics retrieval
- Summary statistics across all branches
- AI insights generation (planned)
- Top performer identification

**Rationale**: FastAPI was chosen for its automatic API documentation (OpenAPI), native async support, and high performance. Pandas provides powerful data manipulation capabilities essential for financial analytics. The RESTful design allows for easy integration with multiple frontends (web dashboard, mobile apps, etc.).

### AI Engine Architecture

**Technology Stack**: OpenAI GPT API (primary) with Groq fallback

**Design Pattern**: Provider abstraction with automatic fallback

The AI engine is designed with a fallback mechanism to ensure continuous operation. When the primary GPT-5 API is unavailable or rate-limited, the system automatically switches to Groq or other OpenRouter-compatible models. This ensures uninterrupted service for text generation, insights, and analytics.

**Configuration**: Environment variables control which AI provider is active (`PRIMARY_AI`, `FALLBACK_AI`) with session runtime limits to manage costs.

**Rationale**: The fallback architecture provides resilience against API outages or rate limits. Using environment-based configuration allows for easy switching between providers without code changes. This design supports the $5/20-minute session budget constraint.

### Messaging and Communication Layer

**Technology Stack**: Twilio WhatsApp API + Telegram Bot API (planned)

**Design Pattern**: Multi-channel messaging with unified interface

The system is designed to send automated messages through both WhatsApp (via Twilio) and Telegram to reach branch staff and management. This layer will handle daily KPI reports, motivational messages, and performance alerts.

**Current Status**: API credentials configured in environment template; implementation pending.

**Rationale**: WhatsApp and Telegram are widely used in Kenya, making them ideal channels for reaching microfinance staff. Twilio provides reliable WhatsApp business messaging. Supporting multiple channels ensures message delivery even if one platform is unavailable.

### Data Storage Architecture

**Planned Stack**: PostgreSQL (structured data) + MongoDB (unstructured data)

**Design Pattern**: Polyglot persistence with CSV fallback

**PostgreSQL**: Intended for structured loan data including disbursements, collections, arrears, customer records, and branch information. Provides ACID compliance and relational integrity for financial data.

**MongoDB**: Planned for unstructured message logs, AI-generated insights, and communication history. Offers flexible schema for evolving data structures.

**CSV Fallback**: If database connections fail, the system temporarily persists data to CSV files to maintain continuity.

**Current Status**: SQLAlchemy and psycopg2-binary dependencies installed; database schemas not yet implemented. Currently using in-memory sample data.

**Rationale**: PostgreSQL is industry-standard for financial applications requiring data integrity. MongoDB handles variable-structure data efficiently. The CSV fallback ensures the system remains operational during database outages, critical for the 20-minute session continuity model.

### Data Processing Pipeline

**Technology Stack**: Pandas + NumPy + Scikit-learn (planned)

**Design Pattern**: ETL (Extract, Transform, Load) with in-memory processing

Data ingestion supports CSV, Excel, and API-based sources. Pandas handles data transformation, cleaning, and aggregation. The system calculates derived metrics like collection rates, performance rankings, and trend analysis.

**Planned Enhancement**: Scikit-learn integration for predictive analytics and forecasting.

**Rationale**: Pandas is the Python standard for data manipulation and integrates seamlessly with FastAPI. Supporting multiple input formats (CSV, Excel, API) provides flexibility for different data sources across 100+ branches.

### Session Continuity Architecture

**Design Pattern**: Stateless sessions with comprehensive progress logging

The system is designed for 20-minute development sessions with automatic handover. All progress, file paths, API integrations, and architectural decisions are logged in `REPLIT.md` to enable the next agent to continue work seamlessly.

**Configuration**: Environment variables control session runtime (`SESSION_RUNTIME_MINUTES=20`), debug mode, and logging level.

**Rationale**: This architecture supports the unique constraint of $5/20-minute work sessions by ensuring each session can pick up where the previous one left off without context loss.

## External Dependencies

### AI and LLM Services
- **OpenAI API**: Primary AI provider for GPT-based text generation, insights, and recommendations
- **Groq API**: Fallback LLM service when OpenAI is unavailable or rate-limited

### Messaging Platforms
- **Twilio WhatsApp API**: WhatsApp Business messaging for staff communications
  - Requires: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
- **Telegram Bot API**: Alternative messaging channel for notifications and reports
  - Requires: `TELEGRAM_BOT_TOKEN`

### Databases
- **PostgreSQL**: Relational database for structured loan and customer data
  - Connection via `POSTGRES_URI`
  - Accessed through SQLAlchemy ORM and psycopg2 driver
- **MongoDB**: NoSQL database for unstructured message logs and AI outputs
  - Connection via `MONGODB_URI`

### Python Libraries
- **FastAPI 0.104.1**: Web framework for RESTful API
- **Uvicorn 0.24.0**: ASGI server for FastAPI
- **Pandas 2.1.3**: Data manipulation and analysis
- **NumPy 1.26.2**: Numerical computing
- **SQLAlchemy 2.0.23**: Database ORM
- **psycopg2-binary 2.9.9**: PostgreSQL adapter
- **python-dotenv 1.0.0**: Environment variable management

### Frontend Libraries
- **React 19.1.1**: UI framework
- **Vite 7.1.7**: Build tool and dev server
- **Tailwind CSS 4.1.14**: Utility-first CSS framework
- **PostCSS 8.5.6**: CSS transformation tool
- **Autoprefixer 10.4.21**: CSS vendor prefixing

### Development Tools
- **ESLint 9.36.0**: JavaScript linting
- **eslint-plugin-react-hooks**: React Hooks linting rules
- **eslint-plugin-react-refresh**: React Fast Refresh linting

### Hosting and Runtime
- **Replit**: Development and hosting platform
- **Environment Variables**: Managed through `.env` file (template provided as `Kechita_env_template.txt`)

### Machine Learning Libraries
- **XGBoost 3.1.0**: Gradient boosting framework for credit scoring
- **Scikit-learn 1.7.2**: Machine learning library for model preprocessing and evaluation
- **SciPy 1.16.2**: Scientific computing library for statistical analysis

### Planned Integrations
- **LangChain**: For advanced AI prompt chaining and conversation management
- **Excel/CSV Parsers**: For automated data ingestion from branch reports

## Credit Scoring System

The platform includes an advanced credit scoring engine powered by XGBoost machine learning:

### Features Analyzed (15+ metrics):
- Payment history and collection rates
- Loan completion rates
- Customer tenure and loyalty
- Payment frequency and consistency
- Arrears ratio and overdue loans
- Average loan size and disbursement patterns

### Risk Categories:
- **Excellent (750-850)**: Premium customers, low risk, best rates
- **Good (650-749)**: Reliable customers, standard terms
- **Fair (550-649)**: Moderate risk, requires monitoring
- **Poor (450-549)**: High risk, strict conditions
- **High Risk (<450)**: Not recommended for new loans

### Recommendations:
- Maximum loan amounts based on credit score
- Recommended interest rates (12%-25%)
- Approval likelihood assessment
- Customized suggestions for each customer

## Data Generation

The platform uses an intelligent data generator that creates realistic Kenyan microfinance data:

### Geographic Coverage:
- 100+ branches across all Kenyan counties
- 8 regions: Central, Coast, Eastern, Nairobi, North Eastern, Nyanza, Rift Valley, Western
- Authentic Kenyan names and phone number formats

### Customer Data:
- 50-200 customers per branch
- 1-3 loans per customer
- Realistic payment behaviors (excellent, good, average, poor, defaulter)
- Registration dates spanning 2+ years

### Loan Portfolio:
- Loan amounts: KES 5,000 - 500,000
- Loan terms: 30-180 days
- Payment behaviors weighted realistically (30% excellent, 35% good, 20% average, 10% poor, 5% defaulters)
- Collection rates reflecting actual microfinance patterns

### Portfolio Statistics:
- Total portfolio value: ~KES 200M+
- 10,000+ loans
- 5,000+ customers
- 100+ branches
- Regional distribution across Kenya