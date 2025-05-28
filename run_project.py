#!/usr/bin/env python3

import os
import sys
import subprocess
import platform
import time
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AutoAnalystRunner:
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        
    def check_python(self):
        """Check if Python 3.8+ is available"""
        try:
            version = sys.version_info
            if version.major < 3 or (version.major == 3 and version.minor < 8):
                logger.error("Python 3.8 or higher is required")
                return False
            logger.info(f"Python {version.major}.{version.minor}.{version.micro} detected")
            return True
        except Exception as e:
            logger.error(f"Error checking Python version: {e}")
            return False
    
    def check_node(self):
        """Check if Node.js is available"""
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                logger.info(f"Node.js {result.stdout.strip()} detected")
                return True
            else:
                logger.warning("Node.js not found - frontend features will be limited")
                return False
        except FileNotFoundError:
            logger.warning("Node.js not found - frontend features will be limited")
            return False
    
    def create_venv(self):
        """Create virtual environment for backend"""
        venv_path = self.backend_dir / "venv"
        
        if venv_path.exists():
            logger.info("Virtual environment already exists")
            return True
        
        try:
            logger.info("Creating virtual environment...")
            subprocess.run([sys.executable, "-m", "venv", str(venv_path)], check=True)
            logger.info("Virtual environment created successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to create virtual environment: {e}")
            return False
    
    def get_pip_path(self):
        """Get pip executable path"""
        if platform.system() == "Windows":
            return self.backend_dir / "venv" / "Scripts" / "pip.exe"
        else:
            return self.backend_dir / "venv" / "bin" / "pip"
    
    def get_python_path(self):
        """Get Python executable path"""
        if platform.system() == "Windows":
            return self.backend_dir / "venv" / "Scripts" / "python.exe"
        else:
            return self.backend_dir / "venv" / "bin" / "python"
    
    def install_backend_dependencies(self):
        """Install backend Python dependencies"""
        try:
            pip_path = self.get_pip_path()
            requirements_path = self.backend_dir / "requirements.txt"
            
            if not requirements_path.exists():
                logger.error("requirements.txt not found")
                return False
            
            logger.info("Installing backend dependencies...")
            subprocess.run([
                str(pip_path), "install", "-r", str(requirements_path)
            ], check=True, cwd=self.backend_dir)
            
            logger.info("Backend dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install backend dependencies: {e}")
            return False
    
    def setup_environment(self):
        """Setup environment variables"""
        env_file = self.backend_dir / ".env"
        env_example = self.backend_dir / "env_example.txt"
        
        if env_file.exists():
            logger.info("Environment file already exists")
            return True
        
        if env_example.exists():
            try:
                # Copy example to .env
                with open(env_example, 'r') as src, open(env_file, 'w') as dst:
                    content = src.read()
                    dst.write(content)
                
                logger.info("Environment file created from example")
                logger.warning("Please edit .env file and add your OpenAI API key!")
                return True
            except Exception as e:
                logger.error(f"Failed to create environment file: {e}")
                return False
        
        # Create basic .env file
        env_content = """# AutoAnalyst AI Environment Configuration
# Get your OpenAI API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Optional: LangChain settings
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=

# Database settings
DATABASE_URL=sqlite:///./db/analytics.db

# Application settings
DEBUG=true
HOST=0.0.0.0
PORT=8000
"""
        
        try:
            with open(env_file, 'w') as f:
                f.write(env_content)
            logger.info("Basic environment file created")
            logger.warning("Please edit .env file and add your OpenAI API key!")
            return True
        except Exception as e:
            logger.error(f"Failed to create environment file: {e}")
            return False
    
    def run_backend(self):
        """Start the backend server"""
        try:
            python_path = self.get_python_path()
            
            # Check if .env has OpenAI API key
            env_file = self.backend_dir / ".env"
            if env_file.exists():
                with open(env_file, 'r') as f:
                    content = f.read()
                    if "your_openai_api_key_here" in content:
                        logger.error("Please set your OpenAI API key in the .env file!")
                        logger.info("Edit backend/.env and replace 'your_openai_api_key_here' with your actual API key")
                        return False
            
            logger.info("Starting AutoAnalyst AI backend...")
            logger.info("Backend will be available at: http://localhost:8000")
            logger.info("API documentation: http://localhost:8000/docs")
            
            # Start the backend server
            os.chdir(self.backend_dir)
            subprocess.run([
                str(python_path), "-m", "uvicorn", "app.main:app", 
                "--reload", "--host", "0.0.0.0", "--port", "8000"
            ], check=True)
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to start backend: {e}")
            return False
        except KeyboardInterrupt:
            logger.info("Backend server stopped")
            return True
    
    def install_frontend_dependencies(self):
        """Install frontend dependencies"""
        if not self.check_node():
            return False
        
        package_json = self.frontend_dir / "package.json"
        if not package_json.exists():
            logger.warning("package.json not found - skipping frontend setup")
            return False
        
        try:
            logger.info("Installing frontend dependencies...")
            subprocess.run(["npm", "install"], check=True, cwd=self.frontend_dir)
            logger.info("Frontend dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install frontend dependencies: {e}")
            return False
    
    def show_usage_instructions(self):
        """Show usage instructions"""
        print("""
🎉 AutoAnalyst AI Setup Complete!

📋 USAGE INSTRUCTIONS:

1. 🔑 Set your OpenAI API Key:
   - Edit: backend/.env
   - Replace 'your_openai_api_key_here' with your actual OpenAI API key
   - Get your key from: https://platform.openai.com/api-keys

2. 🚀 Start the Backend:
   - Run: python run_project.py
   - Backend URL: http://localhost:8000
   - API Docs: http://localhost:8000/docs

3. 💬 Test the System:
   - Use the API documentation at http://localhost:8000/docs
   - Upload documents via POST /api/upload
   - Ask questions via POST /api/ask

4. 📊 Example Queries:
   - "What are the top 5 customers by revenue?"
   - "Show me monthly sales trends"
   - "What is the latest news about AI transformers?"

5. 📁 Upload Documents:
   - Upload PDFs, text files, or Word documents
   - Ask questions about the content

🔧 TROUBLESHOOTING:
- Make sure you have Python 3.8+ installed
- Install dependencies: pip install -r backend/requirements.txt
- Check logs for any error messages

For more help, see the README.md file.
        """)
    
    def run(self):
        """Main execution flow"""
        logger.info("🚀 Starting AutoAnalyst AI Setup...")
        
        # Check prerequisites
        if not self.check_python():
            return False
        
        # Setup backend
        if not self.create_venv():
            return False
        
        if not self.install_backend_dependencies():
            return False
        
        if not self.setup_environment():
            return False
        
        # Check if this is first-time setup
        env_file = self.backend_dir / ".env"
        if env_file.exists():
            with open(env_file, 'r') as f:
                content = f.read()
                if "your_openai_api_key_here" in content:
                    logger.info("✅ Setup completed!")
                    self.show_usage_instructions()
                    return True
        
        # Run the backend
        return self.run_backend()

def main():
    """Main entry point"""
    runner = AutoAnalystRunner()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--setup-only":
        # Just do setup, don't run server
        runner.check_python()
        runner.create_venv()
        runner.install_backend_dependencies()
        runner.setup_environment()
        runner.show_usage_instructions()
    else:
        # Full run
        success = runner.run()
        if not success:
            sys.exit(1)

if __name__ == "__main__":
    main() 