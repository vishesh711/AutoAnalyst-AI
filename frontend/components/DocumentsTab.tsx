import React, { useState, useRef, useEffect } from 'react';
import { ApiService, Document } from '../services/api';
import FallbackState from './FallbackState';

// Simple FileIcon component for document types
const FileIcon = ({ type }: { type: string }) => {
  // Return different SVG icons based on file type
  const getIconColor = () => {
    switch(type.toLowerCase()) {
      case 'pdf': return 'text-red-400';
      case 'doc':
      case 'docx': return 'text-blue-400';
      case 'xls':
      case 'xlsx': return 'text-green-400';
      case 'ppt':
      case 'pptx': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <svg className={`h-5 w-5 ${getIconColor()}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
};

const DocumentsTab = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check backend status on component mount and when backend status changes
  useEffect(() => {
    // Set offline state based on API service status
    setIsOffline(!ApiService.isBackendOnline);
    // Fetch documents initially
    fetchDocuments();
  }, []);

  // Check for backend status changes periodically
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // Update local offline state based on global backend status
      setIsOffline(!ApiService.isBackendOnline);
    }, 5000);
    
    return () => clearInterval(checkInterval);
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    setUploadError(null);
    try {
      if (!ApiService.isBackendOnline) {
        // Mock documents for offline mode
        setDocuments(sampleDocuments);
      } else {
        const response = await ApiService.fetchDocuments();
        setDocuments(response.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (!ApiService.isBackendOnline) {
        // Fallback to sample docs in offline mode
        setDocuments(sampleDocuments);
      } else {
        setError('Failed to load documents. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchDocuments();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadError(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadError(null);
    
    if (isOffline) {
      setUploadError('Cannot upload documents while offline. Please check your backend connection.');
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isOffline) {
      setUploadError('Cannot upload documents while offline. Please check your backend connection.');
      return;
    }
    
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadError(null);
    
    for (const file of files) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadError(`File ${file.name} exceeds the 10MB size limit.`);
        continue;
      }
      
      // Validate file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['pdf', 'docx', 'doc', 'txt', 'md', 'xlsx'].includes(ext)) {
        setUploadError(`File ${file.name} has an unsupported format. Please upload PDF, DOCX, DOC, TXT, XLSX or MD files.`);
        continue;
      }
      
      // Add temporary document with uploading status
      const tempDoc: Document = {
        id: `temp-${Date.now()}-${file.name}`,
        filename: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        status: 'uploading',
        progress: 0
      };
      
      setDocuments(prev => [...prev, tempDoc]);
      
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === tempDoc.id && doc.status === 'uploading'
                ? { ...doc, progress: Math.min((doc.progress || 0) + 10, 90) }
                : doc
            )
          );
        }, 300);
        
        // Upload the file
        const result = await ApiService.uploadDocument(file);
        
        clearInterval(progressInterval);
        
        // Update document with result from server
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === tempDoc.id
              ? { 
                  ...doc, 
                  id: result.id,
                  status: 'completed',
                  progress: 100,
                  chunks_count: result.chunks_count,
                  processed: true
                }
              : doc
          )
        );
      } catch (error: any) {
        console.error('Error uploading file:', error);
        
        // Extract error message
        let errorMessage = 'Error uploading file. Please try again.';
        if (error.response && error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.isNetworkError) {
          errorMessage = 'Cannot upload while offline. Please check your backend connection.';
        }
        
        // Update document with error status
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === tempDoc.id
              ? { ...doc, status: 'error', progress: 0 }
              : doc
          )
        );
        
        setUploadError(errorMessage);
      }
    }
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (isOffline) {
      setUploadError('Cannot delete documents while offline. Please check your backend connection.');
      return;
    }
    
    try {
      // Remove from UI immediately for better UX
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Delete from server
      await ApiService.deleteDocument(documentId);
      
      // Refresh the document list after deletion
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      // Reload documents in case of error
      fetchDocuments();
    }
  };

  // Utility functions
  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (dateValue: string | Date | undefined): string => {
    if (!dateValue) return '';
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Add sample documents for offline mode
  const sampleDocuments: Document[] = [
    { 
      id: 'sample-1', 
      filename: 'Financial Report Q3.pdf', 
      size: 2457600, 
      uploadDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      status: 'completed',
      processed: true,
      chunks_count: 42
    },
    { 
      id: 'sample-2', 
      filename: 'Market Analysis 2023.docx', 
      size: 1356800, 
      uploadDate: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      status: 'completed',
      processed: true,
      chunks_count: 28
    },
    { 
      id: 'sample-3', 
      filename: 'Customer Survey Results.xlsx', 
      size: 954400, 
      uploadDate: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      status: 'completed',
      processed: true,
      chunks_count: 18
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Document Management</h2>
        
        {/* Refresh button */}
        <button 
          onClick={handleRetry}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      {isOffline && (
        <div className="mb-4 bg-yellow-900/20 border border-yellow-800 text-yellow-200 p-3 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Running in offline mode</p>
              <p className="text-sm mt-1">Backend server not detected. Showing sample documents.</p>
              <button 
                onClick={handleRetry}
                className="text-sm text-yellow-300 hover:text-yellow-100 mt-2"
              >
                Try to reconnect
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
          uploadError ? 'border-red-400 bg-red-900/20' : 'border-indigo-400 bg-indigo-900/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,.xlsx"
          disabled={isOffline}
        />
        
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
          <p className="text-slate-400 mb-4">
            {isOffline 
              ? "Upload is disabled in offline mode" 
              : "Drag and drop files here, or click to select"
            }
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${
              isOffline 
                ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            } px-4 py-2 rounded-lg transition-colors`}
            disabled={isOffline}
          >
            Select Files
          </button>
        </div>
        
        <div className="text-xs text-slate-400">
          Supported formats: PDF, DOCX, DOC, TXT, MD, XLSX (Max 10MB)
        </div>
      </div>
      
      {/* Error message */}
      {uploadError && (
        <div className="mb-4 bg-red-900/20 border border-red-800 text-red-200 p-3 rounded-lg">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{uploadError}</span>
          </div>
        </div>
      )}
      
      {/* Documents list */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-medium mb-3 flex items-center justify-between">
          <span>Your Documents</span>
          {documents.length > 0 && (
            <span className="text-sm text-slate-400">{documents.length} documents</span>
          )}
        </h3>
        
        {loading && documents.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FallbackState 
              title="No documents found"
              message={isOffline 
                ? "You're in offline mode. Documents can't be loaded until the backend is available." 
                : "Upload documents to analyze and search through them"
              }
              onRetry={isOffline ? handleRetry : undefined}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div 
                key={doc.id} 
                className="bg-slate-800 rounded-lg p-4 flex items-center"
              >
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center mr-4">
                  <FileIcon type={doc.filename.split('.').pop() || ''} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{doc.filename}</h4>
                  <div className="flex text-xs text-slate-400 mt-1">
                    <span className="mr-3">{formatFileSize(doc.size || doc.file_size)}</span>
                    <span>{formatDate(doc.uploadDate || doc.uploaded_date)}</span>
                    {doc.chunks_count !== undefined && doc.chunks_count > 0 && (
                      <span className="ml-3">
                        {doc.chunks_count} {doc.chunks_count === 1 ? 'chunk' : 'chunks'}
                      </span>
                    )}
                  </div>
                  
                  {doc.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="h-1 bg-slate-700 rounded overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600" 
                          style={{ width: `${doc.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Uploading... {doc.progress}%
                      </div>
                    </div>
                  )}
                  
                  {doc.status === 'error' && (
                    <div className="text-xs text-red-400 mt-1">
                      Error uploading file. Please try again.
                    </div>
                  )}
                  
                  {doc.processed === false && doc.status !== 'uploading' && doc.status !== 'error' && (
                    <div className="text-xs text-yellow-400 mt-1">
                      Not yet processed. Processing may take a moment.
                    </div>
                  )}
                </div>
                
                <div>
                  {doc.status !== 'uploading' && (
                    <button 
                      onClick={() => handleDeleteDocument(doc.id || doc.filename)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-700 transition-colors"
                      disabled={isOffline}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTab; 