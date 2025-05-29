from langchain.tools import BaseTool
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader, UnstructuredWordDocumentLoader
from langchain.schema import Document
from typing import Dict, List, Any, Optional
import os
import pickle
import logging
from datetime import datetime

from app.llm.factory import create_llm, create_embeddings
from app.config import get_settings

logger = logging.getLogger(__name__)

class RAGTool(BaseTool):
    """Tool for Retrieval-Augmented Generation using FAISS vector database"""
    
    name: str = "rag_search"
    description: str = """Use this tool to search through uploaded documents and knowledge bases.
    
    This tool is best for:
    - Finding information from uploaded PDFs, documents, or reports
    - Research questions that might be answered by existing knowledge
    - Questions about specific papers, studies, or content
    - Literature reviews and document analysis
    
    Input should be a search query describing what information you're looking for."""
    
    class Config:
        arbitrary_types_allowed = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        object.__setattr__(self, '_settings', get_settings())
        object.__setattr__(self, 'embeddings', None)
        object.__setattr__(self, 'vectorstore', None)
        object.__setattr__(self, 'text_splitter', None)
        object.__setattr__(self, 'document_metadata', {})
        
    @property
    def settings(self):
        """Get settings"""
        return self._settings
        
    async def initialize(self):
        """Initialize the RAG tool with embeddings and vector store"""
        try:
            # Initialize embeddings using factory
            object.__setattr__(self, 'embeddings', create_embeddings())
            
            # Initialize text splitter
            object.__setattr__(self, 'text_splitter', RecursiveCharacterTextSplitter(
                chunk_size=self.settings.CHUNK_SIZE,
                chunk_overlap=self.settings.CHUNK_OVERLAP,
                separators=["\n\n", "\n", ". ", " ", ""]
            ))
            
            # Load or create vector store
            await self._load_or_create_vectorstore()
            
            logger.info("RAG tool initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing RAG tool: {str(e)}")
            raise
    
    async def _load_or_create_vectorstore(self):
        """Load existing vector store or create a new one"""
        vectorstore_path = os.path.join(self.settings.VECTOR_DB_PATH, "faiss_index")
        metadata_path = os.path.join(self.settings.VECTOR_DB_PATH, "metadata.pkl")
        
        if os.path.exists(vectorstore_path + ".faiss") and os.path.exists(metadata_path):
            try:
                # Load existing vector store
                vectorstore = FAISS.load_local(
                    vectorstore_path, 
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                object.__setattr__(self, 'vectorstore', vectorstore)
                
                # Load metadata
                with open(metadata_path, 'rb') as f:
                    metadata = pickle.load(f)
                object.__setattr__(self, 'document_metadata', metadata)
                
                logger.info(f"Loaded existing vector store with {len(self.document_metadata)} documents")
                
            except Exception as e:
                logger.warning(f"Failed to load existing vector store: {str(e)}")
                await self._create_empty_vectorstore()
        else:
            await self._create_empty_vectorstore()
    
    async def _create_empty_vectorstore(self):
        """Create an empty vector store"""
        try:
            # Create FAISS index without dummy document
            from langchain_community.vectorstores.faiss import dependable_faiss_import
            faiss = dependable_faiss_import()
            
            # Initialize empty index with correct dimensions
            dimension = self.settings.EMBEDDING_DIMENSION
            index = faiss.IndexFlatL2(dimension)
            
            # Create empty vectorstore
            vectorstore = FAISS(self.embeddings, index, {}, {}, {})
            object.__setattr__(self, 'vectorstore', vectorstore)
            
            # Save the empty vector store
            await self._save_vectorstore()
            
            logger.info("Created new empty vector store")
            
        except Exception as e:
            logger.error(f"Error creating empty vector store: {str(e)}")
            raise
    
    async def _save_vectorstore(self):
        """Save vector store and metadata"""
        try:
            os.makedirs(self.settings.VECTOR_DB_PATH, exist_ok=True)
            
            vectorstore_path = os.path.join(self.settings.VECTOR_DB_PATH, "faiss_index")
            metadata_path = os.path.join(self.settings.VECTOR_DB_PATH, "metadata.pkl")
            
            # Save vector store
            self.vectorstore.save_local(vectorstore_path)
            
            # Save metadata
            with open(metadata_path, 'wb') as f:
                pickle.dump(self.document_metadata, f)
                
        except Exception as e:
            logger.error(f"Error saving vector store: {str(e)}")
            raise
    
    async def add_document(self, file_path: str) -> Dict[str, Any]:
        """Add a document to the vector store"""
        try:
            # Load document based on file type
            documents = await self._load_document(file_path)
            
            if not documents:
                raise ValueError("No content extracted from document")
            
            # Split documents into chunks
            chunks = self.text_splitter.split_documents(documents)
            
            # Add metadata
            filename = os.path.basename(file_path)
            for chunk in chunks:
                chunk.metadata.update({
                    "source": filename,
                    "file_path": file_path,
                    "added_date": datetime.now().isoformat(),
                    "chunk_index": chunks.index(chunk)
                })
            
            # Add to vector store
            if chunks:
                if self.vectorstore.index.ntotal == 1:  # Only dummy document
                    # Replace dummy document
                    new_vectorstore = FAISS.from_documents(
                        chunks,
                        self.embeddings
                    )
                    object.__setattr__(self, 'vectorstore', new_vectorstore)
                else:
                    # Add to existing store
                    self.vectorstore.add_documents(chunks)
                
                # Update metadata
                new_metadata = self.document_metadata.copy()
                new_metadata[filename] = {
                    "file_path": file_path,
                    "chunks_count": len(chunks),
                    "added_date": datetime.now().isoformat(),
                    "file_size": os.path.getsize(file_path)
                }
                object.__setattr__(self, 'document_metadata', new_metadata)
                
                # Save updated vector store
                await self._save_vectorstore()
                
                logger.info(f"Added document '{filename}' with {len(chunks)} chunks")
                
                return {
                    "status": "success",
                    "filename": filename,
                    "chunks_added": len(chunks)
                }
            
        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            raise
    
    async def _load_document(self, file_path: str) -> List[Document]:
        """Load document based on file type"""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_extension == '.pdf':
                loader = PyPDFLoader(file_path)
            elif file_extension in ['.txt', '.md']:
                loader = TextLoader(file_path, encoding='utf-8')
            elif file_extension in ['.docx', '.doc']:
                loader = UnstructuredWordDocumentLoader(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
            
            documents = loader.load()
            return documents
            
        except Exception as e:
            logger.error(f"Error loading document {file_path}: {str(e)}")
            raise
    
    def _run(self, query: str) -> Dict[str, Any]:
        """Synchronous run method (required by BaseTool)"""
        import asyncio
        return asyncio.run(self._arun(query))
    
    async def _arun(self, query: str) -> Dict[str, Any]:
        """Search for relevant documents based on query"""
        try:
            if not self.vectorstore:
                return {
                    "answer": "The document search system is not initialized yet. Please try again in a moment.",
                    "sources": [],
                    "query": query
                }
            
            # Check if any documents have been uploaded
            if len(self.document_metadata) == 0:
                return {
                    "answer": "No documents have been uploaded yet. Please upload some documents first.",
                    "sources": [],
                    "query": query
                }
            
            # Check if vectorstore has any vectors
            if self.vectorstore.index.ntotal == 0:
                return {
                    "answer": "The document database is empty. Please upload some documents first.",
                    "sources": [],
                    "query": query
                }
            
            # Perform similarity search
            docs = self.vectorstore.similarity_search_with_score(
                query,
                k=5  # Use a default if TOP_K_DOCUMENTS not in settings
            )
            
            # Filter by similarity threshold
            relevant_docs = []
            for doc, score in docs:
                # Convert score to similarity (FAISS returns distance, lower is better)
                similarity = 1.0 / (1.0 + score)
                if similarity > 0.7:  # Threshold for relevance
                    relevant_docs.append((doc, similarity))
            
            if not relevant_docs:
                return {
                    "answer": "I couldn't find any relevant information in the uploaded documents. Please try rephrasing your question or upload more relevant documents.",
                    "sources": [],
                    "query": query
                }
                
            # Format context from relevant documents
            context = "\n\n".join([f"Document: {doc.metadata.get('source', 'Unknown')}\nContent: {doc.page_content}" for doc, _ in relevant_docs])
            
            # Generate answer
            answer = await self._generate_answer(query, context)
            
            # Format sources
            sources = []
            for doc, similarity in relevant_docs:
                sources.append({
                    "filename": doc.metadata.get("source", "Unknown"),
                    "similarity": round(similarity * 100, 2),
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content
                })
            
            return {
                "answer": answer,
                "sources": sources,
                "query": query
            }
            
        except Exception as e:
            logger.error(f"Error in RAG search: {str(e)}")
            return {
                "answer": f"I encountered an error while searching through documents: {str(e)}. Please try again later.",
                "sources": [],
                "query": query
            }
    
    async def _generate_answer(self, query: str, context: str) -> str:
        """Generate answer based on retrieved context"""
        try:
            llm = create_llm()
            
            prompt = f"""Based on the following context from uploaded documents, please answer the user's question. 
If the context doesn't contain enough information to answer the question completely, say so and provide what information is available.

Context:
{context}

Question: {query}

Answer:"""
            
            # Handle different LLM types
            if hasattr(llm, 'ainvoke'):
                response = await llm.ainvoke(prompt)
                return response.content if hasattr(response, 'content') else str(response)
            else:
                response = await llm._acall(prompt)
                return response
            
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return f"I found relevant information but couldn't generate a complete answer: {str(e)}"
    
    async def list_documents(self) -> List[Dict[str, Any]]:
        """List all documents in the vector store"""
        return [
            {
                "filename": filename,
                **metadata
            }
            for filename, metadata in self.document_metadata.items()
        ]
    
    async def delete_document(self, filename: str) -> bool:
        """Delete a document from the vector store"""
        try:
            if filename not in self.document_metadata:
                return False
            
            # Remove from metadata
            new_metadata = self.document_metadata.copy()
            del new_metadata[filename]
            object.__setattr__(self, 'document_metadata', new_metadata)
            
            # Note: FAISS doesn't support deletion of specific documents
            # We would need to rebuild the entire index
            # For now, we'll just remove from metadata and rebuild if needed
            
            await self._save_vectorstore()
            
            logger.info(f"Removed document '{filename}' from metadata")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            return False
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of the RAG tool"""
        return {
            "status": "healthy" if self.vectorstore else "not_initialized",
            "documents_count": len(self.document_metadata),
            "embeddings_initialized": self.embeddings is not None,
            "vectorstore_initialized": self.vectorstore is not None
        } 