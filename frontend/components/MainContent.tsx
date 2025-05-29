import React, { useState, useEffect } from 'react';
import ChatTab from './ChatTab';
import DocumentsTab from './DocumentsTab';
import StatsTab from './StatsTab';
import ErrorBoundary from './ErrorBoundary';
import FallbackState from './FallbackState';
import History from './History';
import Header from './Header';

interface MainContentProps {
  activeTab?: string;
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  activeTab = 'chat',
  darkMode = false,
  setDarkMode = () => {}
}) => {
  const [historyItems, setHistoryItems] = useState([
    { id: '1', title: 'Financial Analysis Q3', timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: '2', title: 'Market Research 2023', timestamp: new Date(Date.now() - 3600000 * 24) },
    { id: '3', title: 'Customer Demographics', timestamp: new Date(Date.now() - 3600000 * 48) },
  ]);

  const handleSelectHistoryItem = (id: string) => {
    console.log('Selected history item:', id);
    // TODO: Implement history item selection
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'chat':
        return <ChatTab onNewChat={(title: string) => {
          setHistoryItems(prev => [{
            id: Date.now().toString(),
            title,
            timestamp: new Date()
          }, ...prev]);
        }} />;
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={getTabTitle()} darkMode={darkMode} setDarkMode={setDarkMode} />
      
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
  );
};

export default MainContent; 