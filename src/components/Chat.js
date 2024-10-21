import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function Chat({ onSendMessage, chatOutput }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="chat">
      <div className="chat-header">Type Chat</div>
      <div className="chat-messages">
        <ReactMarkdown>{chatOutput}</ReactMarkdown>
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
}

export default Chat;
