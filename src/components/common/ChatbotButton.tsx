import { useState } from 'react';
import Chatbot from './Chatbot';
import './ChatbotButton.css';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    setHasStarted(false); // Reset when truly closing
  };

  const handleMinimize = () => {
    setIsOpen(false);
    setHasStarted(true); // Keep the session alive
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasStarted(true);
  };

  return (
    <>
      {!isOpen && (
        <button
          className="chatbot-toggle-button"
          onClick={handleOpen}
          aria-label="Mở chat hỗ trợ"
        >
          <span className="chat-icon">💬</span>
          {hasStarted && <span className="notification-badge">!</span>}
        </button>
      )}

      {hasStarted && (
        <div className="chatbot-wrapper" style={{ display: isOpen ? 'block' : 'none' }}>
          <Chatbot onClose={handleClose} onMinimize={handleMinimize} />
        </div>
      )}
    </>
  );
};

export default ChatbotButton;
