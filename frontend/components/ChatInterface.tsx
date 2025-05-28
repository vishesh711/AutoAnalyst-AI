import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  DocumentArrowDownIcon,
  ClockIcon,
  LinkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: any[]
  charts?: any[]
  query_type?: string
}

interface ChatInterfaceProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
  onExportPDF: () => void
}

// Enhanced icons
const Icons = {
  Send: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Download: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  User: () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Robot: () => (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9H4V15C4 16.1 4.9 17 6 17H8V22H16V17H18C19.1 17 20 16.1 20 15V9H21ZM18 15H6V9H18V15ZM8 11.5C8 10.7 8.7 10 9.5 10S11 10.7 11 11.5 10.3 13 9.5 13 8 12.3 8 11.5ZM13 11.5C13 10.7 13.7 10 14.5 10S16 10.7 16 11.5 15.3 13 14.5 13 13 12.3 13 11.5Z"/>
    </svg>
  ),
  Source: () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Chart: () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
    </svg>
  ),
  Loading: () => (
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Microphone: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

export default function ChatInterface({ messages, isLoading, onSendMessage, onExportPDF }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsTyping(true)
    onSendMessage(input.trim())
    setInput('')
    
    // Simulate typing effect
    setTimeout(() => setIsTyping(false), 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const getQueryTypeColor = (type?: string) => {
    switch (type) {
      case 'rag_search': return 'bg-accent-100 text-accent-700 border-accent-200 dark:bg-accent-800/20 dark:text-accent-300 dark:border-accent-700/30'
      case 'sql_analytics': return 'bg-secondary-100 text-secondary-700 border-secondary-200 dark:bg-secondary-800/20 dark:text-secondary-300 dark:border-secondary-700/30'
      case 'web_search': return 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-800/20 dark:text-primary-300 dark:border-primary-700/30'
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-dark-700 dark:text-dark-300 dark:border-dark-600'
    }
  }

  const getQueryTypeLabel = (type?: string) => {
    switch (type) {
      case 'rag_search': return 'Document Search'
      case 'sql_analytics': return 'Data Analysis'
      case 'web_search': return 'Web Search'
      default: return 'AI Response'
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white/80 dark:bg-dark-800/95 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-dark-xl border border-neutral-200 dark:border-dark-700 overflow-hidden transition-colors duration-300">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-dark-800 px-6 py-4 border-b border-neutral-200 dark:border-dark-700 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 dark:from-primary-600 dark:to-primary-500 rounded-xl flex items-center justify-center shadow-lg dark:shadow-dark-lg animate-pulse-slow">
              <Icons.Robot />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white transition-colors duration-300">AI Assistant</h3>
              <p className="text-sm text-neutral-600 dark:text-gray-300 transition-colors duration-300">
                {isLoading ? 'Thinking...' : `${messages.length} messages`}
              </p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={onExportPDF}
              className="flex items-center space-x-2 bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-lg border border-primary-200 dark:border-primary-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 transform hover:scale-105 shadow-md dark:shadow-dark-lg"
            >
              <Icons.Download />
              <span className="text-sm font-medium">Export PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-neutral-50 to-white dark:from-dark-900 dark:to-dark-800 transition-colors duration-300">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex space-x-4 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            {message.type === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg dark:shadow-dark-lg">
                  <Icons.Robot />
                </div>
              </div>
            )}
            
            <div className={`max-w-3xl ${message.type === 'user' ? 'order-1' : ''}`}>
              {/* Query Type Badge for Assistant Messages */}
              {message.type === 'assistant' && message.query_type && (
                <div className="mb-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm dark:shadow-dark-sm transition-colors duration-300 ${getQueryTypeColor(message.query_type)}`}>
                    {getQueryTypeLabel(message.query_type)}
                  </span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`relative px-6 py-4 rounded-2xl shadow-lg transition-colors duration-300 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-md dark:shadow-dark-md'
                    : 'bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 shadow-md dark:shadow-dark-md'
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    className={`mb-0 leading-relaxed transition-colors duration-300 ${
                      message.type === 'user' ? 'text-white' : 'text-neutral-800 dark:text-gray-200'
                    }`}
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                
                {/* Message timestamp */}
                <div className={`text-xs mt-2 transition-colors duration-300 ${
                  message.type === 'user' ? 'text-white/70' : 'text-neutral-500 dark:text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </div>

                {/* Speech bubble arrow */}
                <div className={`absolute top-4 w-3 h-3 transform rotate-45 transition-colors duration-300 ${
                  message.type === 'user' 
                    ? 'right-[-6px] bg-primary-500' 
                    : 'left-[-6px] bg-white dark:bg-dark-800 border-l border-b border-neutral-200 dark:border-dark-700'
                }`} />
              </div>

              {/* Sources and Charts */}
              {message.type === 'assistant' && ((message.sources && message.sources.length > 0) || (message.charts && message.charts.length > 0)) && (
                <div className="mt-4 space-y-3">
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="bg-accent-50 dark:bg-accent-900/20 rounded-xl p-4 border border-accent-200 dark:border-accent-700/30 transition-colors duration-300">
                      <div className="flex items-center space-x-2 mb-3">
                        <Icons.Source />
                        <h4 className="font-medium text-accent-800 dark:text-accent-300 transition-colors duration-300">Sources</h4>
                      </div>
                      <div className="space-y-2">
                        {message.sources.slice(0, 3).map((source, idx) => (
                          <div key={idx} className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-accent-200 dark:border-accent-700/30 transition-colors duration-300">
                            <p className="text-sm text-neutral-800 dark:text-dark-200 font-medium mb-1 transition-colors duration-300">
                              {source.title || source.source || 'Source Document'}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-dark-400 line-clamp-2 transition-colors duration-300">
                              {source.snippet || source.content?.substring(0, 150) + '...'}
                            </p>
                            {source.score && (
                              <div className="mt-2">
                                <span className="text-xs text-accent-600 dark:text-accent-400 font-medium transition-colors duration-300">
                                  Relevance: {Math.round(source.score * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Charts */}
                  {message.charts && message.charts.length > 0 && (
                    <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700/30 transition-colors duration-300">
                      <div className="flex items-center space-x-2 mb-3">
                        <Icons.Chart />
                        <h4 className="font-medium text-secondary-800 dark:text-secondary-300 transition-colors duration-300">Generated Charts</h4>
                      </div>
                      <div className="grid gap-4">
                        {message.charts.map((chart, idx) => (
                          <div key={idx} className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700/30 transition-colors duration-300">
                            <h5 className="font-medium text-neutral-800 dark:text-dark-200 mb-2 transition-colors duration-300">{chart.title}</h5>
                            {chart.image_url && (
                              <img 
                                src={chart.image_url} 
                                alt={chart.title}
                                className="w-full h-auto rounded-lg border border-neutral-200 dark:border-dark-600 transition-colors duration-300"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-neutral-600 to-neutral-500 dark:from-gray-500 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-md dark:shadow-dark-md text-white">
                  <Icons.User />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Animation */}
        {isLoading && (
          <div className="flex space-x-4 justify-start animate-fadeIn">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg dark:shadow-dark-lg animate-pulse-slow">
                <Icons.Robot />
              </div>
            </div>
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-neutral-200 dark:border-dark-700 rounded-xl px-6 py-4 shadow-md dark:shadow-dark-md transition-colors duration-300">
              <div className="flex items-center space-x-3">
                <div className="relative w-5 h-5">
                  <div className="absolute top-0 left-0 w-full h-full animate-ping rounded-full bg-primary-400 opacity-30"></div>
                  <div className="absolute top-0 left-0 w-full h-full animate-pulse rounded-full bg-primary-500 opacity-70"></div>
                  <div className="absolute top-[15%] left-[15%] w-[70%] h-[70%] bg-primary-600 rounded-full"></div>
                </div>
                <span className="text-neutral-600 dark:text-gray-300 transition-colors duration-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t border-neutral-200 dark:border-dark-700 bg-white/80 dark:bg-dark-800/90 backdrop-blur-sm p-6 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your documents, data, or search the web..."
              className="w-full px-6 py-4 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm border border-neutral-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent resize-none shadow-md dark:shadow-dark-md transition-all duration-200 hover:border-neutral-400 dark:hover:border-dark-500 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-gray-400"
              rows={1}
              style={{
                minHeight: '56px',
                maxHeight: '120px',
                resize: 'none'
              }}
              disabled={isLoading}
            />
            
            {/* Character count */}
            <div className="absolute bottom-2 right-4 text-xs text-neutral-400 dark:text-gray-500 transition-colors duration-300">
              {input.length}/500
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              className="p-4 text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-xl transition-all duration-200 transform hover:scale-105"
              title="Voice input (coming soon)"
            >
              <Icons.Microphone />
            </button>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-4 rounded-xl font-medium transition-all duration-300 transform ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white hover:shadow-lg hover:shadow-primary-500/20 dark:hover:shadow-primary-500/10 hover:scale-105'
                  : 'bg-neutral-200 dark:bg-dark-700 text-neutral-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Icons.Loading />
              ) : (
                <Icons.Send />
              )}
            </button>
          </div>
        </form>
        
        {/* Quick suggestions */}
        {messages.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "What can you help me with?",
              "Show me sales data",
              "Upload a document",
              "Search for recent news"
            ].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setInput(suggestion)}
                className="px-4 py-2 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm border border-neutral-200 dark:border-dark-600 rounded-full text-sm text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-dark-600 hover:border-neutral-300 dark:hover:border-primary-500/50 hover:shadow-md dark:hover:shadow-dark-md transition-all duration-200 transform hover:scale-105"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 