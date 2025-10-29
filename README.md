# K-Show 2025 - Balena AI Platform 🚀

> **Advanced Exhibition Management & Company Discovery Platform**  
> A comprehensive AI-powered system for managing K-Show 2025 exhibition visits, company discovery, and business intelligence.

## 📋 Project Overview

This platform combines a modern Next.js web application with powerful Python scraping tools to provide complete exhibition management capabilities for K-Show 2025. The system includes real-time company discovery, AI-powered recommendations, business card scanning, visit tracking, and comprehensive data management.

### 🎯 Key Features

- **🔍 Company Discovery**: Advanced search and filtering with AI recommendations
- **📊 Real-time Analytics**: Live dashboard with visit tracking and statistics  
- **🤖 AI-Powered Recommendations**: Smart suggestions based on company profiles
- **📱 Business Card Scanner**: OCR-powered card scanning with company linking
- **🗺️ Route Optimization**: Intelligent visit planning and route optimization
- **📈 Visit Management**: Complete visit tracking with follow-up capabilities
- **🏢 Logo System**: Automated logo scraping and manual upload system
- **📤 Data Export**: Comprehensive export capabilities for analysis

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling framework
- **Framer Motion** - Smooth animations
- **Supabase** - Real-time database and authentication
- **Tesseract.js** - OCR for business card scanning

### Backend & Data
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Python** - Data scraping and processing
- **Selenium** - Web scraping automation
- **BeautifulSoup** - HTML parsing
- **Pandas** - Data manipulation

### Deployment
- **Vercel** - Frontend hosting and deployment
- **Supabase** - Backend infrastructure and storage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- Chrome browser (for scraping)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd balena

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Environment Setup

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

```bash
# Run the database schema setup
psql -h your-supabase-host -d postgres -f src/lib/database-schema.sql

# Setup logo storage
python setup_logo_storage.py
```

### 4. Run the Application

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 📊 Data Management

### Company Data Scraping

The platform includes advanced scraping capabilities for K-Show exhibitor data:

```bash
# Run the ultimate scraper for comprehensive data
python ultimate_k_show_scraper.py

# Test with limited companies
python ultimate_k_show_scraper.py --limit 10

# Run specific company scraping
python test_single_company.py
```

### Logo Management

Automated logo extraction and management:

```bash
# Setup logo storage system
python setup_logo_storage.py

# Run logo scraper for all companies
python auto_update_all_logos.py

# Upload logos to Supabase
python upload_logos_to_supabase.py
```

### Data Processing

```bash
# Load CSV data to Supabase
python load_csv_to_supabase.py

# Update company data
python update_all_companies_mcp.py

# Export processed data
python prepare_supabase_csv.py
```

## 🧪 Testing

### Frontend Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Backend Testing

```bash
# Test scraper functionality
python test_single_popup.py

# Test business card processing
python test_process_control.py

# Verify setup
python check_setup.py
```

## 📁 Project Structure

```
balena/
├── src/                          # Next.js application
│   ├── app/                      # App router pages
│   ├── components/               # React components
│   ├── hooks/                    # Custom hooks
│   └── lib/                      # Utilities and database
├── scripts/                      # Automation scripts
├── logos/                        # Logo assets
├── enhanced_data/                # Processed company data
├── ultimate_results/             # Scraping results
├── *.py                         # Python scraping tools
├── *.sql                        # Database migrations
└── *.csv                        # Data files
```

### Key Components

- **`CompanyDiscoveryPage.tsx`** - Main company browsing interface
- **`EnhancedCompanyModal.tsx`** - Detailed company view and editing
- **`SmartBusinessCardScanner.tsx`** - OCR business card processing
- **`SmartRecommendations.tsx`** - AI-powered company suggestions
- **`RouteOptimizer.tsx`** - Visit planning and optimization

### Python Tools

- **`ultimate_k_show_scraper.py`** - Comprehensive company data scraper
- **`auto_update_all_logos.py`** - Automated logo extraction
- **`mcp_ultimate_updater.py`** - Batch data processing
- **`website_enricher.py`** - Website content analysis

## 🔧 Configuration

### Scraper Settings

Configure scraping behavior in the Python scripts:

```python
# Delays and timeouts
MIN_DELAY = 1.5
MAX_DELAY = 3.0
PAGE_LOAD_TIMEOUT = 30

# Browser settings
WINDOW_WIDTH = 1920
WINDOW_HEIGHT = 1080
```

### Database Configuration

Key database tables:
- `companies` - Main company data
- `business_cards` - Scanned business card information
- `visits` - Visit tracking and status
- `company_logos` - Logo management

## 📈 Monitoring & Logging

### Application Logs

- **Frontend**: Browser console and Vercel logs
- **Scraping**: `ultimate_scraper.log`, `enhanced_popup_scraper.log`
- **Processing**: Individual script logs

### Performance Monitoring

- Real-time database subscriptions
- Scraping success rates and statistics
- User interaction analytics

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
# Deploy to Vercel
vercel --prod

# Or use GitHub integration for automatic deployments
```

### Database Migrations

```bash
# Apply new migrations
python run_sql_updates.py

# Batch updates
python quick_batch_runner.py
```

## 📚 Documentation

Additional documentation available:

- **[Implementation Plan](IMPLEMENTATION_PLAN.md)** - Detailed development roadmap
- **[Feature Plan](FEATURE_PLAN.md)** - Complete feature specifications
- **[Scraper Documentation](SCRAPER_README.md)** - Scraping system details
- **[Logo System](LOGO_SYSTEM_README.md)** - Logo management guide
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for Balena Science.

## 🆘 Support

For issues and questions:

1. Check the logs in respective `.log` files
2. Verify database connections and permissions
3. Ensure all environment variables are set correctly
4. Contact the development team for technical support

---

**Built with ❤️ for K-Show 2025 by the Balena Team**

*Last updated: October 2025*