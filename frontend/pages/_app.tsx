import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import ErrorBoundary from '../components/ErrorBoundary'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  const [darkMode, setDarkMode] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    // Apply dark mode to document
    document.documentElement.classList.toggle('dark', darkMode)
    // Store preference
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      setHasError(true)
      // Prevent the default browser error handling
      event.preventDefault()
    }

    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <>
      <Head>
        <title>AutoAnalyst AI</title>
        <meta name="description" content="AI Chat Helper for data analysis and research" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ErrorBoundary>
        <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-200`}>
          <Component {...pageProps} darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  )
} 