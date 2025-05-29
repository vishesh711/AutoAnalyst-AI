import React from 'react';

export interface HistoryItem {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  isSelected?: boolean;
  timestamp?: Date;
}

interface HistoryProps {
  items: HistoryItem[];
  onSelectItem: (id: string) => void;
}

const History = ({ items, onSelectItem }: HistoryProps) => {
  return (
    <div className="w-64 bg-slate-900 border-l border-slate-800 h-full overflow-auto flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-white font-medium">History</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ul className="p-3 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSelectItem(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                  item.isSelected 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  <span className="w-6 h-6 flex-shrink-0 mr-2 bg-slate-800 rounded flex items-center justify-center">
                    {item.icon || '📄'}
                  </span>
                  <span className="font-medium truncate">{item.title}</span>
                </div>
                {item.description ? (
                  <p className="text-xs text-gray-400 truncate">{item.description}</p>
                ) : item.timestamp ? (
                  <p className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-3 border-t border-slate-800">
        <button 
          className="w-full flex items-center justify-center text-gray-400 hover:text-white p-2"
          onClick={() => {/* Clear history */}}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear history
        </button>
      </div>
    </div>
  );
};

export default History; 