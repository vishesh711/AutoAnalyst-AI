import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ChatTab to avoid circular dependency issues
const ChatTab = dynamic(() => import('./ChatTab'), { ssr: false });

interface AIChatProps {
  backendStatus?: 'online' | 'offline' | 'loading';
  onNewChat?: (title: string) => void;
}

// This is a compatibility wrapper for the ChatTab component
const AIChat: React.FC<AIChatProps> = ({ backendStatus, onNewChat }) => {
  return <ChatTab onNewChat={onNewChat} />;
};

export default AIChat; 