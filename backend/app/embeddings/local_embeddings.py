from typing import List
import logging
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings
from app.config import get_settings

logger = logging.getLogger(__name__)

class LocalEmbeddings(Embeddings):
    """Local embeddings using sentence-transformers"""
    
    def __init__(self, model_name: str = None):
        settings = get_settings()
        self.model_name = model_name or settings.EMBEDDING_MODEL
        
        logger.info(f"Loading embedding model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
        logger.info("Embedding model loaded successfully")
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents"""
        try:
            embeddings = self.model.encode(texts, convert_to_tensor=False)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error embedding documents: {str(e)}")
            raise
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query"""
        try:
            embedding = self.model.encode([text], convert_to_tensor=False)
            return embedding[0].tolist()
        except Exception as e:
            logger.error(f"Error embedding query: {str(e)}")
            raise
    
    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        """Async embed documents"""
        return self.embed_documents(texts)
    
    async def aembed_query(self, text: str) -> List[float]:
        """Async embed query"""
        return self.embed_query(text) 