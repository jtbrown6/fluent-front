import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function Chat({ onSendMessage, chatHistory, onResetConversation }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      setIsLoading(true);
      await onSendMessage(message);
      setMessage('');
      setIsLoading(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <span>Type Chat</span>
        <button onClick={onResetConversation} className="reset-button">Reset</button>
      </div>
      <div className="chat-messages" ref={chatMessagesRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You:' : 'AI:'}</strong>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <strong>AI:</strong> Thinking...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}

export default Chat;
