import React from 'react';

interface HeaderProps {
  title: string;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const Header = ({ title, darkMode, setDarkMode }: HeaderProps) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
      <h1 className="text-lg font-medium text-white">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="bg-slate-800 text-white rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        
        <button className="text-gray-400 hover:text-white" onClick={() => setDarkMode(!darkMode)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        
        <div className="flex items-center text-sm text-white">
          <span>History</span>
          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">6/50</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 