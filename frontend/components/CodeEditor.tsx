import React, { useState } from 'react';

interface CodeEditorProps {
  initialCode?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode = '' }) => {
  const [activeTab, setActiveTab] = useState('JS');
  const [code, setCode] = useState(initialCode || 
`let cancelButton = document.getElementById("cancel-button");
let sendButton = document.getElementById("send-button");

cancelButton.addEventListener("click", function() {
  console.log("Cancel button clicked");
});

sendButton.addEventListener("click", function() {
  console.log("Send button clicked");
});`);

  // Line numbers for the code
  const lineNumbers = code.split('\n').map((_, idx) => idx + 1);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-700 bg-slate-950">
      {/* Tabs */}
      <div className="flex bg-slate-900 px-4">
        <button 
          className={`py-2 px-4 text-sm ${activeTab === 'HTML' ? 'text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('HTML')}
        >
          HTML
        </button>
        <button 
          className={`py-2 px-4 text-sm ${activeTab === 'CSS' ? 'text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('CSS')}
        >
          CSS
        </button>
        <button 
          className={`py-2 px-4 text-sm ${activeTab === 'JS' ? 'text-white bg-indigo-600 rounded-t' : 'text-gray-400'}`}
          onClick={() => setActiveTab('JS')}
        >
          JS
        </button>
        <div className="ml-auto flex items-center">
          <button className="text-sm text-gray-400 hover:text-white px-2">
            Copy code
          </button>
        </div>
      </div>

      {/* Code editor */}
      <div className="flex bg-slate-950 text-sm font-mono">
        {/* Line numbers */}
        <div className="py-4 px-2 text-right text-gray-500 select-none bg-slate-900/50 w-12">
          {lineNumbers.map(num => (
            <div key={num} className="leading-6">{num}</div>
          ))}
        </div>
        
        {/* Code content */}
        <pre className="flex-1 p-4 overflow-auto text-white">
          <code>
            {code.split('\n').map((line, idx) => {
              // Simple syntax highlighting
              const highlightedLine = line
                .replace(/(".*?")/g, '<span class="text-green-400">$1</span>')
                .replace(/(let|const|function|return|if|else|for|while)/g, '<span class="text-purple-400">$1</span>')
                .replace(/(\.\w+)(?=\()/g, '<span class="text-yellow-400">$1</span>')
                .replace(/(\w+)(?=\()/g, '<span class="text-blue-400">$1</span>');
              
              return (
                <div key={idx} className="leading-6" dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
              );
            })}
          </code>
        </pre>
      </div>

      {/* Footer note */}
      <div className="p-4 bg-slate-900/50 text-gray-400 text-sm">
        <p>Note: This is just an example of a simple HTML form. In a real-world scenario, you would also want to include proper validation and handling of the form data on the server side.</p>
      </div>

      {/* Action button */}
      <div className="flex justify-end p-4 bg-slate-900/30 border-t border-gray-800">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center">
          View
        </button>
      </div>
    </div>
  );
};

export default CodeEditor; 