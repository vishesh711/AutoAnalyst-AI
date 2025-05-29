import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'chat', name: 'AI Chat', icon: '💬' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'stats', name: 'Statistics', icon: '📊' },
    { id: 'templates', name: 'Templates', icon: '📋', pro: true },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-slate-950 h-screen flex flex-col">
      {/* Logo/App name */}
      <div className="p-4 flex items-center">
        <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center mr-2">
          <span className="text-white font-bold">AI</span>
        </div>
        <h1 className="text-xl font-bold text-white">AutoAnalyst</h1>
        <button className="ml-auto text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-8 flex-1 overflow-y-auto">
        <ul className="px-2 space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-md text-sm ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                } transition-colors duration-200`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
                {item.pro && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 bg-slate-800 text-gray-400 rounded">
                    Pro
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Server Status */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-400">Backend: Running</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Port: 8001 • Status: Healthy
          </div>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium text-white">User</div>
            <div className="text-xs text-gray-400">Free Plan</div>
          </div>
          <button className="ml-auto text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 