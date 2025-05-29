#!/bin/bash

# Display ASCII art banner
echo "
   _         _         _                _           _       _    ___ 
  /_\  _  _ | |_ ___  /_\  _ _  __ _ | | _  _  ___| |_    /_\  |_ _|
 / _ \| || ||  _/ _ \/ _ \| ' \/ _\` || || || |(_-<|  _|  / _ \  | | 
/_/ \_\\\\_,_| \__\___/_/ \_\\_||_\__,_||_| \_,_|/__/ \__| /_/ \_\|___|
                                                                    
"

echo "Starting AutoAnalyst-AI..."

# Check if ports are in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Warning: Port 8000 is already in use. Backend may not start correctly."
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Warning: Port 3000 is already in use. Frontend may not start correctly."
fi

# Set environment variables
export API_PORT=8000
export GROQ_API_KEY=${GROQ_API_KEY:-"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"}

# Check for required dependencies
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    exit 1
fi

if ! command -v python &> /dev/null; then
    echo "Error: Python is not installed."
    exit 1
fi

# Start the backend and frontend concurrently
echo "Starting the backend and frontend services..."
echo "Backend will be available at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:3000"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    exit 1
else
    echo "Using concurrently to start both services..."
    npm run dev
fi

# Exit with the status of the last command
exit $? 