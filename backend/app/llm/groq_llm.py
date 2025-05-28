from typing import Any, Dict, List, Optional
import asyncio
import logging
from groq import Groq
from langchain.llms.base import LLM
from langchain.callbacks.manager import CallbackManagerForLLMRun
from app.config import get_settings

logger = logging.getLogger(__name__)

class GroqLLM(LLM):
    """Custom LangChain LLM wrapper for Groq API"""
    
    client: Any = None
    model_name: str = "llama3-8b-8192"
    temperature: float = 0.1
    max_tokens: int = 2000
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        settings = get_settings()
        
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is required")
            
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model_name = settings.LLM_MODEL
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.MAX_TOKENS
    
    @property
    def _llm_type(self) -> str:
        return "groq"
    
    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Call Groq API synchronously"""
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                stop=stop,
                **kwargs
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error calling Groq API: {str(e)}")
            raise
    
    async def _acall(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Call Groq API asynchronously"""
        # Groq client doesn't have async support yet, so we'll use sync in thread
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            lambda: self._call(prompt, stop, run_manager, **kwargs)
        )
    
    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Get identifying parameters"""
        return {
            "model_name": self.model_name,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        } 