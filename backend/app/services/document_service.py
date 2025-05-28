from typing import Dict, List, Any, Optional
import os
import shutil
import logging
from datetime import datetime

from app.agents.tools.rag_tool import RAGTool
from app.config import get_settings

logger = logging.getLogger(__name__)

class DocumentService:
    """Service for managing document upload, processing, and retrieval"""
    
    def __init__(self):
        self.settings = get_settings()
        self.rag_tool = None
        
    async def initialize(self):
        """Initialize the document service"""
        try:
            # Initialize RAG tool
            self.rag_tool = RAGTool()
            await self.rag_tool.initialize()
            
            # Ensure upload directory exists
            os.makedirs(self.settings.UPLOAD_PATH, exist_ok=True)
            
            logger.info("Document service initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing document service: {str(e)}")
            raise
    
    async def process_document(self, file_path: str) -> Dict[str, Any]:
        """Process an uploaded document and add it to the vector store"""
        try:
            if not self.rag_tool:
                raise ValueError("Document service not initialized")
            
            # Validate file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Add document to RAG tool
            result = await self.rag_tool.add_document(file_path)
            
            logger.info(f"Processed document: {os.path.basename(file_path)}")
            
            return {
                "status": "success",
                "message": f"Document processed successfully",
                "filename": os.path.basename(file_path),
                "chunks_added": result.get("chunks_added", 0),
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            raise
    
    async def list_documents(self) -> List[Dict[str, Any]]:
        """List all uploaded and processed documents"""
        try:
            if not self.rag_tool:
                return []
            
            # Get documents from RAG tool
            rag_documents = await self.rag_tool.list_documents()
            
            # Get files in upload directory
            upload_files = []
            if os.path.exists(self.settings.UPLOAD_PATH):
                for filename in os.listdir(self.settings.UPLOAD_PATH):
                    file_path = os.path.join(self.settings.UPLOAD_PATH, filename)
                    if os.path.isfile(file_path):
                        upload_files.append({
                            "filename": filename,
                            "file_path": file_path,
                            "file_size": os.path.getsize(file_path),
                            "uploaded_date": datetime.fromtimestamp(
                                os.path.getctime(file_path)
                            ).isoformat()
                        })
            
            # Merge information
            documents = []
            for rag_doc in rag_documents:
                # Find corresponding upload file
                upload_info = next(
                    (f for f in upload_files if f["filename"] == rag_doc["filename"]),
                    None
                )
                
                doc_info = {
                    **rag_doc,
                    "processed": True,
                    "upload_info": upload_info
                }
                documents.append(doc_info)
            
            # Add unprocessed files
            processed_filenames = {doc["filename"] for doc in rag_documents}
            for upload_file in upload_files:
                if upload_file["filename"] not in processed_filenames:
                    documents.append({
                        **upload_file,
                        "processed": False,
                        "chunks_count": 0
                    })
            
            return documents
            
        except Exception as e:
            logger.error(f"Error listing documents: {str(e)}")
            return []
    
    async def delete_document(self, filename: str) -> Dict[str, Any]:
        """Delete a document from both storage and vector store"""
        try:
            success = True
            errors = []
            
            # Remove from vector store if RAG tool is available
            if self.rag_tool:
                try:
                    rag_success = await self.rag_tool.delete_document(filename)
                    if not rag_success:
                        errors.append("Document not found in vector store")
                except Exception as e:
                    errors.append(f"Error removing from vector store: {str(e)}")
                    success = False
            
            # Remove physical file
            file_path = os.path.join(self.settings.UPLOAD_PATH, filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    logger.info(f"Deleted file: {filename}")
                except Exception as e:
                    errors.append(f"Error deleting file: {str(e)}")
                    success = False
            else:
                errors.append("File not found in upload directory")
            
            return {
                "status": "success" if success else "partial_success",
                "message": f"Document '{filename}' deletion completed",
                "errors": errors
            }
            
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            return {
                "status": "error",
                "message": f"Failed to delete document: {str(e)}",
                "errors": [str(e)]
            }
    
    async def get_document_info(self, filename: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific document"""
        try:
            documents = await self.list_documents()
            return next(
                (doc for doc in documents if doc["filename"] == filename),
                None
            )
            
        except Exception as e:
            logger.error(f"Error getting document info: {str(e)}")
            return None
    
    async def search_documents(self, query: str) -> Dict[str, Any]:
        """Search through processed documents"""
        try:
            if not self.rag_tool:
                return {
                    "results": [],
                    "message": "Document search not available - RAG tool not initialized"
                }
            
            # Use RAG tool to search
            result = await self.rag_tool._arun(query)
            
            return {
                "results": result.get("sources", []),
                "answer": result.get("answer", ""),
                "query": query,
                "search_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return {
                "results": [],
                "message": f"Search failed: {str(e)}",
                "query": query
            }
    
    async def get_upload_stats(self) -> Dict[str, Any]:
        """Get statistics about uploaded documents"""
        try:
            documents = await self.list_documents()
            
            total_documents = len(documents)
            processed_documents = len([doc for doc in documents if doc.get("processed", False)])
            total_chunks = sum(doc.get("chunks_count", 0) for doc in documents)
            
            # Calculate total file size
            total_size = 0
            for doc in documents:
                if "file_size" in doc:
                    total_size += doc["file_size"]
                elif doc.get("upload_info") and "file_size" in doc["upload_info"]:
                    total_size += doc["upload_info"]["file_size"]
            
            # File type breakdown
            file_types = {}
            for doc in documents:
                filename = doc["filename"]
                ext = os.path.splitext(filename)[1].lower()
                file_types[ext] = file_types.get(ext, 0) + 1
            
            return {
                "total_documents": total_documents,
                "processed_documents": processed_documents,
                "unprocessed_documents": total_documents - processed_documents,
                "total_chunks": total_chunks,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "file_types": file_types,
                "avg_chunks_per_doc": round(total_chunks / max(processed_documents, 1), 1)
            }
            
        except Exception as e:
            logger.error(f"Error getting upload stats: {str(e)}")
            return {
                "total_documents": 0,
                "processed_documents": 0,
                "error": str(e)
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of the document service"""
        try:
            health_info = {
                "status": "healthy",
                "rag_tool_initialized": self.rag_tool is not None,
                "upload_directory_exists": os.path.exists(self.settings.UPLOAD_PATH),
                "upload_directory_writable": os.access(self.settings.UPLOAD_PATH, os.W_OK)
            }
            
            # Check RAG tool health
            if self.rag_tool:
                rag_health = await self.rag_tool.health_check()
                health_info["rag_tool_health"] = rag_health
            
            # Get basic stats
            stats = await self.get_upload_stats()
            health_info["document_stats"] = stats
            
            return health_info
            
        except Exception as e:
            logger.error(f"Document service health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e)
            } 