#!/bin/bash

# AutoAnalyst AI Server Startup Script

echo "🚀 Starting AutoAnalyst AI Server..."

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the AutoAnalyst-AI root directory"
    echo "Current directory: $(pwd)"
    echo "Expected structure: AutoAnalyst-AI/backend/"
    exit 1
fi

# Change to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "../.venv" ] && [ ! -d ".venv" ]; then
    echo "⚠️  Warning: No virtual environment found"
    echo "Consider creating one with: python -m venv .venv"
fi

# Set environment variable to avoid tokenizer warnings
export TOKENIZERS_PARALLELISM=false

echo "📂 Working directory: $(pwd)"
echo "🔧 Starting uvicorn server..."

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 