import React, { useState, useEffect, useRef } from 'react';
import { ApiService, Message } from '../services/api';
import FallbackState from './FallbackState';

interface ChatTabProps {
  onNewChat?: (title: string) => void;
}

const ChatTab: React.FC<ChatTabProps> = ({ onNewChat }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your AI research assistant. How can I help you analyze your documents today?',
      timestamp: new Date(),
    },
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add an offline status check
  const [isOffline, setIsOffline] = useState(!ApiService.isBackendOnline);

  // Check for backend status changes
  useEffect(() => {
    // Set initial state
    setIsOffline(!ApiService.isBackendOnline);
    
    // Set up interval to check
    const checkInterval = setInterval(() => {
      setIsOffline(!ApiService.isBackendOnline);
    }, 5000);
    
    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    // Focus the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom of messages
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Don't submit empty messages
    if (!userInput.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setUserInput('');
    
    // Start loading state
    setIsLoading(true);
    setError(null);
    
    try {
      // If this is the first user message, create a new chat title
      if (messages.length === 1 && onNewChat) {
        const title = userInput.length > 30 
          ? `${userInput.substring(0, 30)}...` 
          : userInput;
        onNewChat(title);
      }
      
      // Send the message to the API
      const response = await ApiService.askQuestion(userInput);
      
      // Add the assistant's response to the chat
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
        charts: response.charts,
        query_type: response.query_type,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      
      // Display an error message in the chat
      setError(err.message || 'Failed to get a response. Please try again.');
      
      // If the backend is completely unavailable, add a fallback message
      if (err.isNetworkError) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm sorry, I'm having trouble connecting to the backend server. Please check your connection and try again.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea as user types
  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // Format message content with Markdown-like syntax
  const formatMessageContent = (content: string) => {
    // Simple formatting - we could use a proper Markdown library here
    return content
      .split('\n')
      .map((line, i) => <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>);
  };

  // Add a nicer offline notice
  const OfflineNotice = () => (
    <div className="bg-blue-900/20 border border-blue-800 text-blue-200 p-4 rounded-lg mb-4">
      <div className="flex items-start">
        <svg className="h-6 w-6 mr-3 mt-0.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium mb-1">Backend Connection Status</p>
          <p className="text-sm mb-2">
            The application is currently in offline mode. You can still type messages, but responses will be limited.
          </p>
          <p className="text-xs">
            Status is checked automatically every 15 seconds.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        {isOffline && <OfflineNotice />}
        
        {messages.length === 0 ? (
          <FallbackState
            title="Start a conversation"
            message="Ask me any question about your documents."
            icon="info"
          />
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  <div className="prose prose-invert">
                    {formatMessageContent(message.content)}
                  </div>
                  
                  {/* Sources section */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Sources:</h4>
                      <ul className="text-sm space-y-1">
                        {message.sources.map((source, idx) => (
                          <li key={idx} className="text-slate-400">
                            {source.filename || source.title}: {source.page || ''} {source.chunk || ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Charts section */}
                  {message.charts && message.charts.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Visualization:</h4>
                      <div className="bg-slate-900 p-3 rounded-md">
                        {/* We would render the chart here */}
                        <div className="h-64 flex items-center justify-center text-slate-400">
                          <p>Chart visualization would render here</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs mt-2 text-slate-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-lg p-4 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && !isLoading && (
              <div className="flex justify-center">
                <div className="bg-red-900/30 border border-red-800 text-red-200 rounded-lg p-3 max-w-3xl">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 mr-2 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 bg-slate-800 rounded-lg p-2">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                autoResizeTextarea(e);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your documents..."
              className="w-full bg-transparent border-0 resize-none focus:ring-0 text-white p-2 h-10 max-h-40"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className={`p-3 rounded-lg ${
              isLoading || !userInput.trim()
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatTab; 