#!/bin/bash

cd backend

# Set the environment variables
export API_PORT=8000
export GROQ_API_KEY=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

# Start the backend
python -m app.main 