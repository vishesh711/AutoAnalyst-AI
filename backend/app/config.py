import os
from pathlib import Path
from typing import Optional

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Environment variables
class Config:
    # LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama3-8b-8192")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.1"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "4000"))
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/db/analytics.db")
    
    # Embedding Configuration
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "384"))
    EMBEDDING_SERVICE: str = os.getenv("EMBEDDING_SERVICE", "huggingface")
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "4000"))
    
    # Vector Database Configuration
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", str(BASE_DIR / "data" / "vector_db"))
    
    # Document Processing Configuration
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".doc", ".txt", ".md"}
    UPLOAD_TEMP_DIR: str = os.getenv("UPLOAD_TEMP_DIR", "/tmp")
    UPLOAD_PATH: str = os.getenv("UPLOAD_PATH", str(BASE_DIR / "data" / "uploads"))
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_RELOAD: bool = os.getenv("API_RELOAD", "True").lower() == "true"
    
    # CORS Configuration
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # Agent Configuration
    AGENT_MAX_ITERATIONS: int = int(os.getenv("AGENT_MAX_ITERATIONS", "10"))
    AGENT_TIMEOUT: int = int(os.getenv("AGENT_TIMEOUT", "300"))  # 5 minutes
    
    # Chart Configuration
    CHART_OUTPUT_DIR: str = os.getenv("CHART_OUTPUT_DIR", str(BASE_DIR / "temp" / "charts"))
    CHART_DPI: int = int(os.getenv("CHART_DPI", "300"))
    CHART_FIGSIZE: tuple = (10, 6)
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Security Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "autoanalyst-ai-secret-key-change-in-production")
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present"""
        if not cls.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        # Create necessary directories
        os.makedirs(cls.VECTOR_DB_PATH, exist_ok=True)
        os.makedirs(cls.CHART_OUTPUT_DIR, exist_ok=True)
        os.makedirs(cls.UPLOAD_PATH, exist_ok=True)
        os.makedirs(BASE_DIR / "db", exist_ok=True)
        
        return True

# Global config instance
config = Config()

# Function to get settings (for compatibility with factory.py)
def get_settings():
    """Returns the global config instance"""
    return config

# Validate configuration on import
try:
    config.validate_config()
except ValueError as e:
    print(f"Configuration Error: {e}")
    print("Please check your environment variables.") 