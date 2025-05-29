// API service for AutoAnalyst-AI
import axios, { AxiosError } from 'axios';

// Message interfaces
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: any[];
  charts?: any[];
  query_type?: string;
}

// Document interfaces
export interface Document {
  id?: string;
  filename: string;
  size?: number;
  file_size?: number; // Backend uses this format
  file_path?: string;
  uploaded_date?: string;
  uploadDate?: string;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  processed?: boolean;
  chunks_count?: number;
}

// Statistics interface
export interface SystemStats {
  documents: {
    total_documents: number;
    processed_documents: number;
    unprocessed_documents: number;
    total_chunks: number;
    total_size_bytes: number;
    total_size_mb: number;
    file_types: Record<string, number>;
    avg_chunks_per_doc: number;
  };
  system: {
    status: string;
    version: string;
  };
}

// Error handling
export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;
  originalError: any;

  constructor(message: string, originalError: any) {
    super(message);
    this.name = 'ApiError';
    this.originalError = originalError;
    this.isNetworkError = false;

    if (axios.isAxiosError(originalError)) {
      this.status = originalError.response?.status;
      this.isNetworkError = !originalError.response;
    }
  }
}

// Debounce function for API calls
const debounce = <F extends (...args: any[]) => Promise<any>>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      // If we're still in cooldown period, return cached mock data
      if (timeSinceLastCall < waitFor) {
        console.log(`API call debounced, waiting ${waitFor - timeSinceLastCall}ms`);
        
        // For health checks, return a rejected promise
        if (func.name === 'healthCheck') {
          reject(new ApiError('API call debounced', new Error('Debounced')));
          return;
        }
        
        // Otherwise resolve with mock data
        if (func.name.includes('list')) {
          resolve(getMockDocuments() as any);
          return;
        } else if (func.name.includes('stats')) {
          resolve(getMockSystemStats() as any);
          return;
        }
      }
      
      if (timeout) {
        clearTimeout(timeout);
      }

      lastCallTime = now;
      
      // Execute the function after the debounce period
      timeout = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  };
};

// Configure axios with defaults
const api = axios.create({
  baseURL: '/api',
  timeout: 5000, // 5 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // Convert axios errors to ApiError for better handling
    let message = 'An unknown error occurred';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 404) {
        message = 'Resource not found';
      } else if (status === 401 || status === 403) {
        message = 'Authentication error';
      } else if (status >= 500) {
        message = 'Server error';
      }
      
      // Try to extract error message from response
      const responseData = error.response.data as any;
      if (responseData && responseData.detail) {
        message = responseData.detail;
      }
    } else if (error.request) {
      // No response received
      message = 'Backend server is unreachable. Please check your connection.';
    } else {
      // Error setting up the request
      message = error.message || 'Error setting up the request';
    }
    
    return Promise.reject(new ApiError(message, error));
  }
);

// Mock data for offline mode
const getMockDocuments = (): Document[] => [
  {
    id: 'mock-1',
    filename: 'quarterly_report_q4_2023.pdf',
    size: 1024 * 1024 * 3.2, // 3.2MB
    uploadDate: new Date().toISOString(),
    status: 'completed',
    processed: true,
    chunks_count: 42
  },
  {
    id: 'mock-2',
    filename: 'financial_analysis_2023.docx',
    size: 1024 * 1024 * 1.8, // 1.8MB
    uploadDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: 'completed',
    processed: true,
    chunks_count: 28
  },
  {
    id: 'mock-3',
    filename: 'customer_demographics.xlsx',
    size: 1024 * 1024 * 4.5, // 4.5MB
    uploadDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: 'completed',
    processed: true,
    chunks_count: 55
  }
];

const getMockSystemStats = (): SystemStats => ({
  documents: {
    total_documents: 3,
    processed_documents: 3,
    unprocessed_documents: 0,
    total_chunks: 125,
    total_size_bytes: 1024 * 1024 * 9.5, // 9.5MB
    total_size_mb: 9.5,
    file_types: { '.pdf': 1, '.docx': 1, '.xlsx': 1 },
    avg_chunks_per_doc: 41.7,
  },
  system: {
    status: 'healthy',
    version: '1.0.0',
  }
});

// Keep track of the last health check result
let lastHealthCheckTime = 0;
let lastHealthCheckResult = false;
const HEALTH_CHECK_COOLDOWN = 5000; // 5 seconds

// API Service for interacting with the backend
export const ApiService = {
  // API base URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  
  // Connection status
  isBackendOnline: false,
  
  // Health check endpoint
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      const data = await response.json();
      this.isBackendOnline = true; // Update status on successful check
      return data;
    } catch (error) {
      this.isBackendOnline = false; // Update status on failed check
      throw error;
    }
  },
  
  // Chat endpoint
  askQuestion: async (query: string, sessionId: string = 'default'): Promise<{
    answer: string;
    sources: any[];
    charts: any[];
    query_type: string;
    session_id: string;
  }> => {
    try {
      const response = await api.post('/ask', { query, session_id: sessionId });
      ApiService.isBackendOnline = true;
      return response.data;
    } catch (error) {
      console.error('Error asking question:', error);
      
      // Return mock response if backend is offline
      if (error instanceof ApiError && error.isNetworkError) {
        return {
          answer: "I'm currently operating in offline mode. The backend server is not available. Your question was: \"" + query + "\". When the backend is running, I'll be able to provide a complete analysis. Please check the server connection and try again later.",
          sources: [],
          charts: [],
          query_type: "general",
          session_id: sessionId
        };
      }
      
      throw error;
    }
  },

  // Document endpoints
  uploadDocument: async (file: File): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      ApiService.isBackendOnline = true;
      return {
        id: response.data.id || `doc-${Date.now()}`,
        filename: response.data.filename,
        status: 'completed',
        uploadDate: new Date().toISOString(),
        chunks_count: response.data.chunks_created || 0,
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async fetchDocuments(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/documents`);
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Return mock data in offline mode
      if (!this.isBackendOnline) {
        return {
          documents: [
            { 
              id: 'sample-1', 
              filename: 'Financial Report Q3.pdf', 
              type: 'pdf', 
              size: 2457600, 
              uploaded_date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
              status: 'completed',
              processed: true,
              chunks_count: 42
            },
            { 
              id: 'sample-2', 
              filename: 'Market Analysis 2023.docx', 
              type: 'docx', 
              size: 1356800, 
              uploaded_date: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
              status: 'completed',
              processed: true,
              chunks_count: 28
            },
            { 
              id: 'sample-3', 
              filename: 'Customer Survey Results.xlsx', 
              type: 'xlsx', 
              size: 954400, 
              uploaded_date: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
              status: 'completed',
              processed: true,
              chunks_count: 18
            },
          ],
          total: 3,
          has_more: false
        };
      }
      throw error;
    }
  },

  deleteDocument: async (documentId: string): Promise<boolean> => {
    try {
      await api.delete(`/documents/${documentId}`);
      ApiService.isBackendOnline = true;
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // System endpoints
  getSystemStats: debounce(async (): Promise<SystemStats> => {
    try {
      const response = await api.get('/stats');
      
      ApiService.isBackendOnline = true;
      
      // Convert backend response format to our interface
      return {
        documents: {
          total_documents: response.data.documents.total_documents || 0,
          processed_documents: response.data.documents.processed_documents || 0,
          unprocessed_documents: response.data.documents.unprocessed_documents || 0,
          total_chunks: response.data.documents.total_chunks || 0,
          total_size_bytes: response.data.documents.total_size_bytes || 0,
          total_size_mb: response.data.documents.total_size_mb || 0,
          file_types: response.data.documents.file_types || {},
          avg_chunks_per_doc: response.data.documents.avg_chunks_per_doc || 0,
        },
        system: {
          status: response.data.system.status || 'unknown',
          version: response.data.system.version || '0.0.0',
        }
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      
      // Return mock data if backend is offline
      if (error instanceof ApiError && error.isNetworkError) {
        return getMockSystemStats();
      }
      
      throw error;
    }
  }, 5000),
}; 