from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import os
from pathlib import Path
from typing import List, Dict, Any
import json
import tempfile
import shutil

from .agents.planner import QueryPlanner
from .services.document_service import DocumentService
from .services.export_service import ExportService

# Initialize FastAPI app
app = FastAPI(
    title="AutoAnalyst AI",
    description="Intelligent research and data analysis platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
query_planner = QueryPlanner()
document_service = DocumentService()
export_service = ExportService()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        await document_service.initialize()
        # Add other service initializations here if needed
    except Exception as e:
        print(f"Error initializing services: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to AutoAnalyst AI",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test query planner
        planner_status = "healthy" if query_planner else "error"
        
        # Test document service
        doc_stats = await document_service.get_upload_stats()
        
        return {
            "status": "healthy",
            "services": {
                "query_planner": {
                    "status": planner_status,
                    "tools_count": len(query_planner.tools) if query_planner.tools else 0,
                    "active_sessions": 1
                },
                "document_service": {
                    "status": "healthy",
                    "document_stats": doc_stats
                },
                "export_service": {
                    "status": "healthy"
                }
            },
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "version": "1.0.0"
        }

@app.post("/api/ask")
async def ask_question(request: Dict[str, Any]):
    """Process user queries using the AI agent"""
    try:
        query = request.get("query", "")
        session_id = request.get("session_id", "default")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        # Process the query using the planner
        response = await query_planner.process_query(query, session_id)
        
        return {
            "answer": response.get("answer", ""),
            "sources": response.get("sources", []),
            "charts": response.get("charts", []),
            "query_type": response.get("query_type", "general"),
            "session_id": session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process documents"""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Validate file type
        allowed_extensions = {'.pdf', '.docx', '.doc', '.txt', '.md'}
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {file_extension} not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = tmp_file.name
        
        try:
            # Process the document
            result = await document_service.process_document(tmp_path, file.filename)
            
            return {
                "id": result["id"],
                "filename": file.filename,
                "status": "completed",
                "message": "Document processed successfully",
                "chunks_created": result.get("chunks_created", 0)
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@app.get("/api/documents")
async def list_documents():
    """Get list of uploaded documents"""
    try:
        documents = document_service.list_documents()
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")

@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document"""
    try:
        success = document_service.delete_document(document_id)
        if success:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

@app.post("/api/export-pdf")
async def export_chat_pdf(request: Dict[str, Any]):
    """Export chat session as PDF"""
    try:
        session_id = request.get("session_id", "default")
        
        # Generate PDF
        pdf_path = await export_service.export_chat_session(session_id)
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail="Failed to generate PDF")
        
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"autoanalyst_report_{session_id[:8]}.pdf"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting PDF: {str(e)}")

@app.get("/api/stats")
async def get_system_stats():
    """Get system statistics"""
    try:
        stats = {
            "documents": document_service.get_stats(),
            "system": {
                "status": "healthy",
                "version": "1.0.0"
            }
        }
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 