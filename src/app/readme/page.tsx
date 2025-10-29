'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Github, 
  Star, 
  Code, 
  Database, 
  Smartphone, 
  Brain, 
  Zap, 
  Shield, 
  Globe,
  Terminal,
  Play,
  TestTube,
  Settings,
  BookOpen,
  Users,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import Link from 'next/link'

export default function ReadmePage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Recommendations",
      description: "Smart suggestions based on company profiles and visit patterns"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Business Card Scanner",
      description: "OCR-powered card scanning with automatic company linking"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Live dashboard with visit tracking and comprehensive statistics"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Company Discovery",
      description: "Advanced search and filtering with intelligent recommendations"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Route Optimization",
      description: "Intelligent visit planning and route optimization algorithms"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Visit Management",
      description: "Complete visit tracking with follow-up capabilities"
    }
  ]

  const techStack = [
    { category: "Frontend", items: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion"] },
    { category: "Backend", items: ["Supabase", "PostgreSQL", "Real-time subscriptions", "Authentication"] },
    { category: "AI & Processing", items: ["Python", "Selenium", "BeautifulSoup", "Tesseract.js"] },
    { category: "Deployment", items: ["Vercel", "Supabase Cloud", "GitHub Actions", "Edge Functions"] }
  ]

  const quickStartSteps = [
    {
      step: "1",
      title: "Clone & Install",
      code: `git clone <repository-url>
cd balena
npm install
pip install -r requirements.txt`
    },
    {
      step: "2", 
      title: "Environment Setup",
      code: `# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key`
    },
    {
      step: "3",
      title: "Database Setup", 
      code: `psql -h host -d postgres -f src/lib/database-schema.sql
python setup_logo_storage.py`
    },
    {
      step: "4",
      title: "Run Application",
      code: `npm run dev
# Visit http://localhost:3000`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="flex items-center space-x-3 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Documentation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative py-20 overflow-hidden"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeInUp} className="mb-8">
            <img
              src="https://balena.science/cdn/shop/files/logo_2x_1102b1b4-e239-4c62-aa43-69f45080c3b1.png?v=1653928291&width=280"
              alt="Balena"
              className="h-16 mx-auto mb-6"
            />
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
              K-Show 2025
              <span className="block text-3xl sm:text-4xl font-light text-slate-600 mt-2">
                Balena AI Platform
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Advanced Exhibition Management & Company Discovery Platform powered by AI
            </p>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Real-time</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="font-medium">Enterprise Ready</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              🎯 Key Features
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage K-Show 2025 exhibition visits effectively
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    <div className="text-slate-600 group-hover:text-slate-900 transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Tech Stack Section */}
      <motion.section 
        className="py-20 bg-slate-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              🛠️ Technology Stack
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built with modern, scalable technologies for optimal performance
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {techStack.map((stack, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-slate-600" />
                  {stack.category}
                </h3>
                <ul className="space-y-2">
                  {stack.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-slate-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Quick Start Section */}
      <motion.section 
        className="py-20 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              🚀 Quick Start
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get up and running in minutes with our step-by-step guide
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {quickStartSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-slate-900 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <pre className="bg-slate-800 rounded-lg p-4 text-sm overflow-x-auto">
                  <code className="text-green-400">{step.code}</code>
                </pre>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Commands Section */}
      <motion.section 
        className="py-20 bg-slate-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              📊 Data Management
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful tools for scraping, processing, and managing exhibition data
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scraping Commands */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Terminal className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Company Data Scraping</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2"># Run comprehensive scraper</p>
                  <code className="text-green-400">python ultimate_k_show_scraper.py</code>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2"># Test with limited companies</p>
                  <code className="text-green-400">python ultimate_k_show_scraper.py --limit 10</code>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2"># Run logo scraper</p>
                  <code className="text-green-400">python auto_update_all_logos.py</code>
                </div>
              </div>
            </motion.div>

            {/* Testing Commands */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TestTube className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Testing & Validation</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2"># Frontend linting</p>
                  <code className="text-green-400">npm run lint</code>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2"># Test scraper functionality</p>
                  <code className="text-green-400">python test_single_company.py</code>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2"># Verify setup</p>
                  <code className="text-green-400">python check_setup.py</code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Project Structure */}
      <motion.section 
        className="py-20 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              📁 Project Structure
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Well-organized codebase with clear separation of concerns
            </p>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="bg-slate-900 rounded-2xl p-6 text-white max-w-4xl mx-auto">
            <pre className="text-sm overflow-x-auto">
              <code className="text-green-400">{`balena/
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
└── *.csv                        # Data files`}</code>
            </pre>
          </motion.div>
        </div>
      </motion.section>

      {/* Documentation Links */}
      <motion.section 
        className="py-20 bg-slate-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              📚 Additional Documentation
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive guides and detailed documentation
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Implementation Plan", file: "IMPLEMENTATION_PLAN.md", icon: <BookOpen className="w-5 h-5" /> },
              { title: "Feature Plan", file: "FEATURE_PLAN.md", icon: <Star className="w-5 h-5" /> },
              { title: "Scraper Guide", file: "SCRAPER_README.md", icon: <Code className="w-5 h-5" /> },
              { title: "Logo System", file: "LOGO_SYSTEM_README.md", icon: <Settings className="w-5 h-5" /> }
            ].map((doc, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                    <div className="text-slate-600">{doc.icon}</div>
                  </div>
                  <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">{doc.file}</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>View Documentation</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="py-12 bg-slate-900 text-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <img
              src="https://balena.science/cdn/shop/files/logo_2x_1102b1b4-e239-4c62-aa43-69f45080c3b1.png?v=1653928291&width=280"
              alt="Balena"
              className="h-12 mx-auto mb-4 opacity-80"
            />
            <p className="text-slate-400 text-lg">
              Built with ❤️ for K-Show 2025 by the Balena Team
            </p>
          </div>
          <div className="flex justify-center space-x-6 text-sm text-slate-400">
            <span>© 2025 Balena Science</span>
            <span>•</span>
            <span>Last updated: October 2025</span>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
