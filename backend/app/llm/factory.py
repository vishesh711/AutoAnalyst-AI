from typing import Any
import logging
from app.config import get_settings
from app.llm.groq_llm import GroqLLM

logger = logging.getLogger(__name__)

def create_llm() -> Any:
    """Create LLM instance based on configuration"""
    settings = get_settings()
    
    # Prefer Groq if API key is available
    if settings.GROQ_API_KEY:
        logger.info(f"Using Groq LLM with model: {settings.LLM_MODEL}")
        return GroqLLM()
    
    # Fallback to OpenAI if available
    elif settings.OPENAI_API_KEY:
        logger.info(f"Using OpenAI LLM with model: {settings.LLM_MODEL}")
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=settings.MAX_TOKENS,
            openai_api_key=settings.OPENAI_API_KEY
        )
    
    else:
        raise ValueError("No LLM API key found. Please set GROQ_API_KEY or OPENAI_API_KEY")

def create_embeddings() -> Any:
    """Create embeddings instance based on configuration"""
    settings = get_settings()
    
    if settings.EMBEDDING_SERVICE == "huggingface" or not settings.OPENAI_API_KEY:
        logger.info(f"Using local embeddings with model: {settings.EMBEDDING_MODEL}")
        from app.embeddings.local_embeddings import LocalEmbeddings
        return LocalEmbeddings()
    
    elif settings.EMBEDDING_SERVICE == "openai" and settings.OPENAI_API_KEY:
        logger.info(f"Using OpenAI embeddings with model: {settings.EMBEDDING_MODEL}")
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            openai_api_key=settings.OPENAI_API_KEY
        )
    
    else:
        logger.warning("Falling back to local embeddings")
        from app.embeddings.local_embeddings import LocalEmbeddings
        return LocalEmbeddings() 