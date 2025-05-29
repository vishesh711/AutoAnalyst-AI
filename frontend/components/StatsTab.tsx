import React, { useState, useEffect } from 'react';
import { ApiService, SystemStats } from '../services/api';
import FallbackState from './FallbackState';

// Import mock data directly to avoid relying on non-existent method
const getMockSystemStats = (): SystemStats => ({
  documents: {
    total_documents: 3,
    processed_documents: 3,
    unprocessed_documents: 0,
    total_chunks: 125,
    total_size_bytes: 1024 * 1024 * 9.5,
    total_size_mb: 9.5,
    file_types: { '.pdf': 1, '.docx': 1, '.xlsx': 1 },
    avg_chunks_per_doc: 41.7,
  },
  system: {
    status: 'offline',
    version: '1.0.0',
  }
});

const StatsTab = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!ApiService.isBackendOnline);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Set initial offline status
    setIsOffline(!ApiService.isBackendOnline);
    
    // Check for backend status changes periodically
    const interval = setInterval(() => {
      setIsOffline(!ApiService.isBackendOnline);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Only load stats if we're online
    if (!isOffline) {
      fetchStats();
    } else {
      // When offline, set sample data
      setStats({
        documents: {
          total_documents: 3,
          processed_documents: 3,
          unprocessed_documents: 0,
          total_chunks: 125,
          total_size_bytes: 9961472, // ~9.5MB
          total_size_mb: 9.5,
          file_types: { '.pdf': 1, '.docx': 1, '.xlsx': 1 },
          avg_chunks_per_doc: 41.7,
        },
        system: {
          status: 'offline',
          version: '1.0.0',
        }
      });
      setIsLoading(false);
    }
  }, [isOffline]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const systemStats = await ApiService.getSystemStats();
      setStats(systemStats);
      setIsOffline(false);
    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      
      if (error.isNetworkError) {
        setIsOffline(true);
        // Use mock stats in offline mode
        setStats(getMockSystemStats());
      } else {
        setError('Failed to load system statistics. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    // Check backend status and update
    ApiService.healthCheck()
      .then(() => {
        setIsOffline(false);
        // Only fetch if we're online
        fetchStats();
      })
      .catch(() => {
        setIsOffline(true);
        // When offline, don't try to fetch
        setIsLoading(false);
      });
  };

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add an offline banner component
  const OfflineBanner = () => (
    <div className="mb-6 bg-yellow-900/20 border border-yellow-800 text-yellow-200 p-4 rounded-lg">
      <div className="flex items-start">
        <svg className="h-5 w-5 mr-3 mt-0.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium mb-1">Offline Mode</p>
          <p className="text-sm">
            You're viewing sample statistics because the backend is currently unavailable.
            Statistics will update automatically when the connection is restored.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">System Statistics</h2>
        
        <button 
          onClick={handleRetry}
          disabled={isLoading}
          className={`text-sm flex items-center ${
            isLoading ? 'text-slate-500 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'
          }`}
        >
          <svg className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {isOffline && <OfflineBanner />}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading system statistics...
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg text-red-200">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
              <button 
                onClick={handleRetry}
                className="text-sm text-red-300 hover:text-red-100 mt-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : !stats ? (
        <FallbackState
          title="No Statistics Available"
          message="Unable to load system statistics. Please try again later."
          onRetry={handleRetry}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">System Status</h3>
              <div className={`text-xs px-2 py-1 rounded-full ${
                stats?.system.status === 'healthy' 
                  ? 'bg-green-900/20 text-green-400 border border-green-800/50' 
                  : 'bg-red-900/20 text-red-400 border border-red-800/50'
              }`}>
                {stats?.system.status.toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-sm text-slate-400">Version</span>
                <span>{stats?.system.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Last updated</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          
          {/* Documents Stats */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="font-medium mb-4">Document Statistics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-400">Total documents</span>
                  <span className="font-medium">{stats?.documents.total_documents || 0}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-400">Processed documents</span>
                  <span className="font-medium">
                    {stats?.documents.processed_documents || 0} / {stats?.documents.total_documents || 0}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${
                        stats?.documents.total_documents 
                          ? (stats.documents.processed_documents / stats.documents.total_documents) * 100 
                          : 0
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-400">Total chunks</span>
                  <span className="font-medium">{stats?.documents.total_chunks || 0}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-400">Total size</span>
                  <span className="font-medium">
                    {stats?.documents.total_size_mb 
                      ? `${stats.documents.total_size_mb.toFixed(2)} MB` 
                      : formatFileSize(stats?.documents.total_size_bytes || 0)}
                  </span>
                </div>
              </div>
              
              {stats?.documents.avg_chunks_per_doc ? (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-400">Avg chunks per document</span>
                    <span className="font-medium">{stats.documents.avg_chunks_per_doc.toFixed(1)}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          
          {/* File Types Card */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="font-medium mb-4">File Types</h3>
            
            {stats?.documents.file_types && Object.keys(stats.documents.file_types).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.documents.file_types).map(([ext, count]) => (
                  <div key={ext} className="flex justify-between items-center">
                    <span>{ext || 'Unknown'}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                      {count} {count === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-sm">No documents uploaded yet</div>
            )}
          </div>
          
          {/* API Health Card */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="font-medium mb-4">API Services</h3>
            
            <ul className="space-y-3">
              {['Query Processing', 'Document Service', 'Export Service'].map((service, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{service}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isOffline || stats?.system.status !== 'healthy'
                      ? 'bg-red-900/20 text-red-400 border border-red-800/50'
                      : 'bg-green-900/20 text-green-400 border border-green-800/50'
                  }`}>
                    {isOffline ? 'Offline' : stats?.system.status === 'healthy' ? 'Operational' : 'Degraded'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsTab; 