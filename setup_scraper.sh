#!/bin/bash

echo "🚀 Setting up K-Show Perfect Scraper..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8 or higher and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    echo "❌ pip is required but not installed."
    echo "Please install pip and try again."
    exit 1
fi

# Use pip3 if available, otherwise pip
PIP_CMD="pip3"
if ! command -v pip3 &> /dev/null; then
    PIP_CMD="pip"
fi

echo "📦 Installing Python dependencies..."
$PIP_CMD install -r requirements_scraper.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies."
    echo "Try running manually: $PIP_CMD install -r requirements_scraper.txt"
    exit 1
fi

echo "🧪 Running test to verify installation..."
python3 -c "
import selenium
import pandas as pd
import requests
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
print('✅ All required packages are working!')
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test the scraper: python3 test_scraper.py"
    echo "2. Run on small batch: python3 kshow_perfect_scraper.py --input companies_rows.csv --output test.csv --limit 5"
    echo "3. Run full scraper: python3 kshow_perfect_scraper.py --input companies_rows.csv --output enriched_companies.csv --headless"
    echo ""
    echo "📚 See SCRAPER_README.md for detailed instructions."
else
    echo "❌ Setup verification failed."
    echo "Please check the error messages above and try again."
    exit 1
fi