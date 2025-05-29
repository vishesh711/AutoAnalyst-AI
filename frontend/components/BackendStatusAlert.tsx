import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

interface BackendStatusAlertProps {
  className?: string;
}

const BackendStatusAlert: React.FC<BackendStatusAlertProps> = ({ className = '' }) => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check status on mount and every 15 seconds
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 15000);
    
    return () => clearInterval(interval);
  }, []);

  // Effect for auto-hiding the alert when backend comes back online
  useEffect(() => {
    if (isBackendOnline) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else if (isBackendOnline === false) { // Only if explicitly false, not null
      setIsVisible(true);
    }
  }, [isBackendOnline]);

  const checkBackendStatus = async () => {
    try {
      await ApiService.healthCheck();
      setIsBackendOnline(true);
      // Only update if changed to avoid unnecessary renders
      if (!ApiService.isBackendOnline) {
        ApiService.isBackendOnline = true;
      }
    } catch (error) {
      setIsBackendOnline(false);
      // Only update if changed to avoid unnecessary renders
      if (ApiService.isBackendOnline) {
        ApiService.isBackendOnline = false;
      }
    }
    
    setLastChecked(new Date());
    setCheckCount(prev => prev + 1);
  };
  
  // Don't show anything until first check completes
  if (isBackendOnline === null) {
    return null;
  }
  
  // Don't show if backend is online and alert has timed out
  if (isBackendOnline && !isVisible) {
    return null;
  }

  return (
    <div className={`${className} transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {isBackendOnline ? (
        <div className="bg-green-900/20 border border-green-800 text-green-200 p-3 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium">Backend connection established</p>
              <p className="text-sm mt-1">All system features are now available.</p>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="ml-auto text-green-300 hover:text-green-100"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-3 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Backend server unavailable</p>
              <p className="text-sm mt-1">
                Some features may be limited. The application is running in offline mode.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button 
                  onClick={checkBackendStatus}
                  className="text-sm text-red-300 hover:text-red-100 inline-flex items-center"
                >
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Check connection
                </button>
                <span className="text-xs text-red-400/70">
                  Last checked: {lastChecked ? new Date(lastChecked).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendStatusAlert; 