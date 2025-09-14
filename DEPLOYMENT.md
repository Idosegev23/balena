# Balena K-Show 2025 - Production Deployment Guide

## Overview
This guide covers deploying the Balena K-Show 2025 application to production.

## Prerequisites
- Node.js 18+ and npm/yarn
- Supabase project with database schema
- Anthropic API key (for AI features)
- OpenAI API key (if using OpenAI features)

## Environment Variables (Required for Production)

### Public Variables (safe to expose in frontend)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NODE_ENV=production
```

### Private Variables (server-side only)
```bash
SUPABASE_SERVICE_KEY=your_service_role_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=generate_secure_random_string_here
```

### Optional Configuration
```bash
# Rate limiting
SCRAPER_DELAY_MIN=3000
SCRAPER_DELAY_MAX=7000
CLAUDE_RATE_LIMIT_RPM=30
CLAUDE_MAX_TOKENS=4096
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Monitoring
LOG_LEVEL=warn
```

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway/Render/Netlify
1. Connect repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Configure environment variables

## Security Considerations

### ✅ Security Features Implemented
- **Content Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Image Security**: Restricted remote patterns for images
- **Environment Protection**: Sensitive keys are server-side only
- **HTTPS Only**: All external resources use HTTPS
- **Rate Limiting**: Built-in rate limiting for API calls

### ⚠️ Manual Steps Required
1. **Generate Secure Session Secret**: 
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Update NEXT_PUBLIC_APP_URL** to your production domain
3. **Configure Supabase RLS policies** for production
4. **Set up monitoring** (optional but recommended)

## Database Setup
Ensure your Supabase database has the following tables:
- `companies` - Company information
- `company_ratings` - User ratings
- `visits` - Visit tracking
- `follow_ups` - Follow-up tasks
- `notes` - User notes
- `business_cards` - Business card data

## Build and Test
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start
```

## Post-Deployment Checklist
- [ ] Environment variables are set correctly
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] API endpoints respond correctly
- [ ] Image loading works
- [ ] All features are in English
- [ ] Mobile responsiveness works
- [ ] HTTPS is enforced
- [ ] Error pages work properly

## Monitoring and Logging
- Monitor application performance
- Set up error tracking (Sentry recommended)
- Monitor API usage and rate limits
- Monitor database performance

## Support
For deployment issues, check:
1. Environment variables configuration
2. Database connection and schema
3. API key validity
4. Build logs for errors