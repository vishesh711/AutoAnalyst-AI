import React, { useState, useRef, useCallback } from 'react'

interface Document {
  id: string
  filename: string
  size: number
  uploadDate: string
  status: 'uploading' | 'completed' | 'error'
  progress?: number
}

interface DocumentUploadProps {
  uploadedDocuments: Document[]
  onDocumentsChange: (documents: Document[]) => void
}

// Enhanced icons
const Icons = {
  Upload: () => (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Document: () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Loading: () => (
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Trash: () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  FileText: () => (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Plus: () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )
}

export default function DocumentUpload({ uploadedDocuments, onDocumentsChange }: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileUpload(files)
  }

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true)

    for (const file of files) {
      // Create temporary document entry
      const tempDoc: Document = {
        id: `temp-${Date.now()}-${Math.random()}`,
        filename: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        status: 'uploading',
        progress: 0
      }

      // Add to list immediately with uploading status
      const updatedDocs = [...uploadedDocuments, tempDoc]
      onDocumentsChange(updatedDocs)

      try {
        const formData = new FormData()
        formData.append('file', file)

        // Update progress manually without interval for now
        let currentProgress = 0
        const updateProgress = () => {
          currentProgress = Math.min(currentProgress + 20, 90)
          const progressDocs = updatedDocs.map(doc => 
            doc.id === tempDoc.id ? { ...doc, progress: currentProgress } : doc
          )
          onDocumentsChange(progressDocs)
        }

        // Simulate some progress
        updateProgress()
        await new Promise(resolve => setTimeout(resolve, 300))
        updateProgress()

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          
          // Update with success status
          const successDocs = updatedDocs.map(doc => 
            doc.id === tempDoc.id 
              ? { ...doc, status: 'completed' as const, progress: 100, id: result.id || doc.id }
              : doc
          )
          onDocumentsChange(successDocs)
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        
        // Update with error status
        const errorDocs = updatedDocs.map(doc => 
          doc.id === tempDoc.id ? { ...doc, status: 'error' as const, progress: 0 } : doc
        )
        onDocumentsChange(errorDocs)
      }
    }

    setIsUploading(false)
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      // Remove from UI immediately for better UX
      const filteredDocs = uploadedDocuments.filter(doc => doc.id !== documentId)
      onDocumentsChange(filteredDocs)

      // TODO: Implement actual delete API call
      // await fetch(`/api/documents/${documentId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Error deleting document:', error)
      // Could add back to list if API call fails
    }
  }

  const retryUpload = (doc: Document) => {
    // For retry, we'll simulate a new upload
    const updatedDoc = { ...doc, status: 'uploading' as const, progress: 0 }
    const updatedDocs = uploadedDocuments.map(d => d.id === doc.id ? updatedDoc : d)
    onDocumentsChange(updatedDocs)
    
    // Simulate upload process again
    setTimeout(() => {
      const finalDoc = { ...updatedDoc, status: 'completed' as const, progress: 100 }
      const finalDocs = uploadedDocuments.map(d => d.id === doc.id ? finalDoc : d)
      onDocumentsChange(finalDocs)
    }, 2000)
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'uploading':
        return <Icons.Loading />
      case 'completed':
        return <Icons.Check />
      case 'error':
        return <Icons.X />
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-primary-600 dark:text-primary-400'
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-2xl p-4 shadow-lg dark:shadow-dark-lg animate-glow-dark">
            <Icons.FileText />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-dark-100 mb-2 transition-colors duration-300">Document Upload</h2>
        <p className="text-lg text-neutral-600 dark:text-dark-300 max-w-2xl mx-auto transition-colors duration-300">
          Upload PDFs, Word documents, and text files to build your knowledge base.
          Ask questions and get instant insights from your documents.
        </p>
      </div>

      {/* Enhanced Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
          isDragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105'
            : 'border-neutral-300 dark:border-dark-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-neutral-50 dark:hover:bg-dark-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-6">
          {/* Upload Icon */}
          <div className={`mx-auto transition-all duration-300 ${
            isDragOver ? 'text-primary-600 scale-110' : 'text-neutral-400 dark:text-dark-500 group-hover:text-primary-500 dark:group-hover:text-primary-400'
          }`}>
            <Icons.Upload />
          </div>

          {/* Upload Text */}
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-dark-100 mb-2 transition-colors duration-300">
              {isDragOver ? 'Drop files here' : 'Upload your documents'}
            </h3>
            <p className="text-neutral-600 dark:text-dark-300 mb-4 transition-colors duration-300">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-neutral-500 dark:text-dark-400 transition-colors duration-300">
              Supports PDF, DOCX, DOC, TXT, MD files • Max 10MB per file
            </p>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            disabled={isUploading}
            className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icons.Plus />
            <span>{isUploading ? 'Uploading...' : 'Select Files'}</span>
          </button>
        </div>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-colors duration-300">
            <div className="text-center">
              <Icons.Loading />
              <p className="mt-2 text-sm text-neutral-600 dark:text-dark-300 transition-colors duration-300">Processing files...</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Documents List */}
      {uploadedDocuments.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-dark-100 transition-colors duration-300">
              Uploaded Documents ({uploadedDocuments.length})
            </h3>
            <div className="text-sm text-neutral-500 dark:text-dark-400 transition-colors duration-300">
              Total size: {formatFileSize(
                uploadedDocuments.reduce((total, doc) => total + doc.size, 0)
              )}
            </div>
          </div>

          <div className="grid gap-4">
            {uploadedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-dark-800 rounded-xl border border-neutral-200 dark:border-dark-700 p-6 shadow-sm dark:shadow-dark-sm hover:shadow-md dark:hover:shadow-dark-md transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  {/* Document Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-accent-100 to-accent-200 dark:from-accent-800 dark:to-accent-700 rounded-xl flex items-center justify-center text-accent-700 dark:text-accent-300 transition-colors duration-300">
                      <Icons.Document />
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-neutral-900 dark:text-dark-100 truncate transition-colors duration-300">
                        {doc.filename}
                      </h4>
                      <div className={`flex items-center space-x-1 transition-colors duration-300 ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span className="text-sm font-medium capitalize">
                          {doc.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-500 dark:text-dark-400 transition-colors duration-300">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.uploadDate)}</span>
                    </div>

                    {/* Progress Bar */}
                    {doc.status === 'uploading' && doc.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-dark-300 mb-1 transition-colors duration-300">
                          <span>Uploading...</span>
                          <span>{doc.progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-dark-700 rounded-full h-2 transition-colors duration-300">
                          <div
                            className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${doc.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {doc.status === 'error' && (
                      <button
                        onClick={() => retryUpload(doc)}
                        className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200"
                        title="Retry upload"
                      >
                        <Icons.Upload />
                      </button>
                    )}
                    
                    {doc.status !== 'uploading' && (
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Delete document"
                      >
                        <Icons.Trash />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadedDocuments.length === 0 && !isUploading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-dark-700 dark:to-dark-600 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400 dark:text-dark-500 transition-colors duration-300">
            <Icons.FileText />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-dark-100 mb-2 transition-colors duration-300">No documents yet</h3>
          <p className="text-neutral-600 dark:text-dark-300 mb-6 max-w-md mx-auto transition-colors duration-300">
            Upload your first document to get started with AI-powered document analysis and insights.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            Upload Your First Document
          </button>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 rounded-2xl p-6 border border-accent-200/50 dark:border-accent-700/30 transition-colors duration-300">
        <h4 className="font-semibold text-accent-900 dark:text-accent-300 mb-3 flex items-center transition-colors duration-300">
          <div className="w-6 h-6 bg-accent-600 rounded-lg flex items-center justify-center mr-2 text-white">
            <Icons.Check />
          </div>
          Tips for better results
        </h4>
        <ul className="space-y-2 text-sm text-accent-800 dark:text-accent-300 transition-colors duration-300">
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-accent-600 dark:bg-accent-400 rounded-full mt-2 mr-3 flex-shrink-0 transition-colors duration-300"></span>
            <span>Upload high-quality, text-based documents for better AI analysis</span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-accent-600 dark:bg-accent-400 rounded-full mt-2 mr-3 flex-shrink-0 transition-colors duration-300"></span>
            <span>Organize related documents together for comprehensive insights</span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-accent-600 dark:bg-accent-400 rounded-full mt-2 mr-3 flex-shrink-0 transition-colors duration-300"></span>
            <span>Use descriptive filenames to help with document identification</span>
          </li>
        </ul>
      </div>
    </div>
  )
} 