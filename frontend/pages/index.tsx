import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DocumentsTab from '../components/DocumentsTab';
import StatsTab from '../components/StatsTab';
import { ApiService } from '../services/api';
import BackendStatusAlert from '../components/BackendStatusAlert';
import ErrorBoundary from '../components/ErrorBoundary';
import FallbackState from '../components/FallbackState';
import Head from 'next/head';
import History, { HistoryItem } from '../components/History';
import dynamic from 'next/dynamic';

// Dynamically import ChatTab to avoid circular dependencies
const ChatTab = dynamic(() => import('../components/ChatTab'), { ssr: false });

interface IndexProps {
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}

export default function Index({ darkMode, setDarkMode }: IndexProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    { id: '1', title: 'Financial Analysis Q3', icon: '📊', description: 'Financial performance analysis', timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: '2', title: 'Market Research 2023', icon: '🔍', description: 'Market trends and insights', timestamp: new Date(Date.now() - 3600000 * 24) },
    { id: '3', title: 'Customer Demographics', icon: '👥', description: 'Customer data analysis', timestamp: new Date(Date.now() - 3600000 * 48) },
  ]);

  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [isBackendChecked, setIsBackendChecked] = useState(false);

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  useEffect(() => {
    // Check backend connection on page load
    const checkBackend = async () => {
      try {
        await ApiService.healthCheck();
      } catch (error) {
        console.error('Backend check error:', error);
      } finally {
        setIsBackendChecked(true);
      }
    };
    
    checkBackend();
  }, []);

  const checkApiStatus = async () => {
    try {
      await ApiService.healthCheck();
      setApiStatus('online');
    } catch (error) {
      console.error('API status check error:', error);
      setApiStatus('offline');
    }
  };

  const handleBackendStatusChange = (status: 'online' | 'offline' | 'loading') => {
    setApiStatus(status);
  };

  const handleSelectHistoryItem = (id: string) => {
    console.log('Selected history item:', id);
    // TODO: Implement history item selection
  };

  // Dynamically import components only when needed
  const renderTabContent = () => {
    switch(activeTab) {
      case 'chat':
        return <ChatTab 
          onNewChat={(title: string) => {
            setHistoryItems(prev => [{
              id: Date.now().toString(),
              title,
              icon: '💬',
              description: 'Chat conversation',
              timestamp: new Date()
            }, ...prev]);
          }} 
        />;
      case 'documents':
        return <DocumentsTab />;
      case 'stats':
        return <StatsTab />;
      default:
        return <div className="p-6">Unknown tab</div>;
    }
  };

  const getTabTitle = () => {
    switch(activeTab) {
      case 'chat': return 'AI Chat';
      case 'documents': return 'Document Management';
      case 'stats': return 'System Statistics';
      default: return 'AutoAnalyst AI';
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-slate-950 text-white">
        <Head>
          <title>AutoAnalyst AI - Your AI-Powered Research Assistant</title>
          <meta name="description" content="AI-powered research and analysis platform" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-700 py-3 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-indigo-400">AutoAnalyst AI</div>
            </div>
            <div>
              <Header 
                title={getTabTitle()} 
                darkMode={darkMode || false} 
                setDarkMode={setDarkMode || (() => {})} 
              />
            </div>
          </div>
        </header>

        {/* Backend status alert */}
        <div className="px-6 pt-4">
          <BackendStatusAlert />
        </div>

        {/* Main content */}
        <main className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <ErrorBoundary fallback={
                  <FallbackState 
                    title="Tab Content Error"
                    message="Something went wrong loading this tab."
                    onRetry={() => window.location.reload()}
                    icon="error"
                  />
                }>
                  {renderTabContent()}
                </ErrorBoundary>
              </div>
              
              {/* Right Sidebar - History (only show for chat tab) */}
              {activeTab === 'chat' && (
                <ErrorBoundary fallback={
                  <FallbackState 
                    title="Panel Error"
                    message="There was an error loading the right panel content."
                    icon="warning"
                  />
                }>
                  <History 
                    items={historyItems} 
                    onSelectItem={handleSelectHistoryItem} 
                  />
                </ErrorBoundary>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 py-2 px-6 text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} AutoAnalyst AI - v1.0.0
        </footer>
      </div>
    </ErrorBoundary>
  );
} 