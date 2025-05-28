import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import ChatInterface from '../components/ChatInterface';
import DocumentUpload from '../components/DocumentUpload';
import StatsPanel from '../components/StatsPanel';

const inter = Inter({ subsets: ['latin'] });

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: any[];
  charts?: any[];
  query_type?: string;
}

interface Document {
  id: string;
  filename: string;
  size: number;
  uploadDate: string;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [activeTab, setActiveTab] = useState('chat');
  const [isClient, setIsClient] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Document state
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Update theme
  useEffect(() => {
    if (isClient) {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode, isClient]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Chat handlers
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: content,
          session_id: 'default'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
        sources: data.sources || [],
        charts: data.charts || [],
        query_type: data.query_type
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please make sure the backend server is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: 'default' }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'autoanalyst-chat-export.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  // Document handlers
  const handleDocumentsChange = (documents: Document[]) => {
    setUploadedDocuments(documents);
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'upload', label: 'Documents', icon: '📁' },
    { id: 'stats', label: 'Statistics', icon: '📊' }
  ];

  if (!isClient) {
    // Return a minimal loading state during hydration
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vetra-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AutoAnalyst AI - Intelligent Research & Analytics Platform</title>
        <meta 
          name="description" 
          content="AutoAnalyst AI - Advanced document analysis, business intelligence, and real-time information retrieval powered by AI" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="AutoAnalyst AI - Intelligent Research & Analytics" />
        <meta property="og:description" content="Advanced AI-powered platform for document analysis, business intelligence, and data insights" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#34214e" />
      </Head>

      <div className={`min-h-screen transition-colors duration-300 ${inter.className}`}>
        {/* Background Gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10" />
        
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-vetra-primary/5 dark:bg-vetra-primary-light/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-4 w-72 h-72 bg-vetra-secondary/5 dark:bg-vetra-secondary-light/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-vetra-accent/5 dark:bg-vetra-accent-light/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg dark:shadow-slate-900/50 animate-pulse-slow">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    AutoAnalyst AI
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Intelligent Research & Analytics
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center space-x-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-lg p-1 shadow-md dark:shadow-slate-900/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-md dark:shadow-slate-900/50'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-700/90'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Dark Mode Toggle */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 shadow-md dark:shadow-slate-900/50 transform hover:scale-105"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <svg className="w-5 h-5 animate-scaleIn" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 animate-scaleIn" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
            <div className="flex bg-white/60 dark:bg-slate-800/60 backdrop-blur-md">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex flex-col items-center py-3 text-xs font-medium transition-all duration-200 
                    ${activeTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20 border-t-2 border-primary-500'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            {activeTab === 'chat' && (
              <div className="text-center animate-fadeInUp">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Welcome to{' '}
                  <span className="bg-gradient-to-r from-vetra-primary to-vetra-secondary bg-clip-text text-transparent">
                    AutoAnalyst AI
                  </span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                  Your intelligent research and analytics platform. Ask questions about your documents, 
                  analyze business data, or get real-time information from the web.
                </p>
              </div>
            )}

            {/* Content Sections */}
            <div className="animate-fadeIn">
              {activeTab === 'chat' && (
                <div className="max-w-4xl mx-auto">
                  <ChatInterface 
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={handleSendMessage}
                    onExportPDF={handleExportPDF}
                  />
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Document Management
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Upload and manage your documents for AI-powered analysis and search
                    </p>
                  </div>
                  <DocumentUpload 
                    uploadedDocuments={uploadedDocuments}
                    onDocumentsChange={handleDocumentsChange}
                  />
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="max-w-6xl mx-auto">
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      System Statistics
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Monitor system performance and usage analytics
                    </p>
                  </div>
                  <StatsPanel />
                </div>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 animate-fadeInUp">
              <div className="group p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-vetra-primary to-vetra-primary-light rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse">
                  <span className="text-white text-xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Document Analysis
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Upload PDFs, documents, and research papers for intelligent search and analysis using advanced RAG technology.
                </p>
              </div>

              <div className="group p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-vetra-secondary to-vetra-secondary-light rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse">
                  <span className="text-white text-xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Business Analytics
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Natural language to SQL conversion with automatic chart generation for comprehensive business intelligence.
                </p>
              </div>

              <div className="group p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-vetra-accent to-vetra-accent-light rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse">
                  <span className="text-white text-xl">🌐</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Real-time Search
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Get current information, latest trends, and up-to-date data from multiple web sources in real-time.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-vetra-primary to-vetra-primary-light rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                  AutoAnalyst AI © 2024
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                <span>Powered by LangChain & Groq</span>
                <span>•</span>
                <span>Next.js & Tailwind CSS</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 