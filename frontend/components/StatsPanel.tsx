import React, { useState, useEffect } from 'react'

const StatsPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/health')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto transition-colors duration-300"></div>
        <p className="mt-2 text-neutral-600 dark:text-dark-300 transition-colors duration-300">Loading statistics...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm dark:shadow-dark-sm border border-neutral-300 dark:border-dark-700 p-6 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-dark-100 mb-6 transition-colors duration-300">System Statistics</h2>
        
        {/* System Health */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200/50 dark:border-primary-700/30 transition-colors duration-300">
            <div className="flex items-center">
              <div className="bg-primary-600 rounded-lg p-2 mr-3 shadow-lg dark:shadow-dark-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-dark-400 transition-colors duration-300">System Status</p>
                <p className={`text-lg font-semibold transition-colors duration-300 ${stats?.status === 'healthy' ? 'text-accent-700 dark:text-accent-300' : 'text-red-600 dark:text-red-400'}`}>
                  {stats?.status || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-4 border border-accent-200/50 dark:border-accent-700/30 transition-colors duration-300">
            <div className="flex items-center">
              <div className="bg-accent-600 rounded-lg p-2 mr-3 shadow-lg dark:shadow-dark-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-dark-400 transition-colors duration-300">Documents</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-dark-100 transition-colors duration-300">
                  {stats?.services?.document_service?.document_stats?.total_documents || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-lg p-4 border border-secondary-200/50 dark:border-secondary-700/30 transition-colors duration-300">
            <div className="flex items-center">
              <div className="bg-secondary-600 rounded-lg p-2 mr-3 shadow-lg dark:shadow-dark-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-dark-400 transition-colors duration-300">Active Sessions</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-dark-100 transition-colors duration-300">
                  {stats?.services?.query_planner?.active_sessions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-100 dark:bg-primary-900/30 rounded-lg p-4 border border-primary-200/50 dark:border-primary-700/30 transition-colors duration-300">
            <div className="flex items-center">
              <div className="bg-primary-700 rounded-lg p-2 mr-3 shadow-lg dark:shadow-dark-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-dark-400 transition-colors duration-300">Tools Available</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-dark-100 transition-colors duration-300">
                  {stats?.services?.query_planner?.tools_count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-dark-100 mb-4 transition-colors duration-300">Service Status</h3>
          <div className="space-y-3">
            {stats?.services && Object.entries(stats.services).map(([service, status]: [string, any]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-dark-700 rounded-lg border border-neutral-200/50 dark:border-dark-600/50 transition-colors duration-300">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 transition-colors duration-300 ${
                    status?.status === 'healthy' ? 'bg-accent-600 dark:bg-accent-400' : 'bg-red-500 dark:bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-dark-100 capitalize transition-colors duration-300">
                    {service.replace('_', ' ')}
                  </span>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full transition-colors duration-300 ${
                  status?.status === 'healthy' 
                    ? 'bg-accent-200 dark:bg-accent-800/50 text-accent-800 dark:text-accent-300' 
                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                }`}>
                  {status?.status || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-neutral-200 dark:border-dark-700 pt-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-dark-100 mb-4 transition-colors duration-300">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={fetchStats}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-dark-lg"
            >
              Refresh Stats
            </button>
            
            <a 
              href="http://localhost:8000/api/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-neutral-600 dark:bg-dark-600 hover:bg-neutral-700 dark:hover:bg-dark-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-center transform hover:scale-105 shadow-lg dark:shadow-dark-lg"
            >
              View Health API
            </a>
            
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-accent-600 hover:bg-accent-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-center transform hover:scale-105 shadow-lg dark:shadow-dark-lg"
            >
              API Documentation
            </a>
          </div>
        </div>

        {/* System Info */}
        {stats && (
          <div className="mt-8 p-4 bg-neutral-100 dark:bg-dark-700 rounded-lg border border-neutral-200/50 dark:border-dark-600/50 transition-colors duration-300">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-dark-100 mb-2 transition-colors duration-300">System Information</h4>
            <pre className="text-xs text-neutral-600 dark:text-dark-300 overflow-auto transition-colors duration-300">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsPanel 