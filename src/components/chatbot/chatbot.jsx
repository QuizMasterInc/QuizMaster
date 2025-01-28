import React, { useState } from 'react';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const responses = {
    greeting: "Hello! How can I assist you today?",
    quiz: "You can start using this app by pressing the take a quiz button to then see the quiz options we provide.",
    help: "I'm here to help! You can ask me about quizzes, categories, difficulty levels, quiz results, and more.",
    default: "Sorry, I didn't understand that. Could you please ask something else?"
  };

  const handleChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!userInput.trim()) {
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: "Please type something!" }]);
      return;
    }

    setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userInput }]);
    setUserInput('');
    setIsLoading(true);

    const lowerInput = userInput.toLowerCase();
    let response = responses.default;

    if (/(hello|hi|hey)/.test(lowerInput)) {
      response = responses.greeting;
    } else if (/(quiz|start quiz|take a quiz)/.test(lowerInput)) {
      response = responses.quiz;
    } else if (/(help|assist|support)/.test(lowerInput)) {
      response = responses.help;
    }

    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: response }]);
      setIsLoading(false);
    }, 1000);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {!isOpen && (
        <div style={styles.chatbotWrapper}>
          <span style={styles.chatbotLabel}>Have a question? Chat with us!</span>
          <button onClick={toggleChatbot} style={styles.chatbotButton}>
            💬 Chatbot
          </button>
        </div>
      )}

      {isOpen && (
        <div style={styles.chatbotContainer}>
          <div style={styles.chatWindow}>
            <div style={styles.chatMessages}>
              {messages.length === 0 && (
                <div style={styles.botMessage}>
                  <div style={styles.messageBubble}>Hello! Ask me anything about the app or quizzes!</div>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} style={message.sender === 'user' ? styles.userMessage : styles.botMessage}>
                  <div style={styles.messageBubble}>{message.text}</div>
                </div>
              ))}
              {isLoading && <div style={styles.botMessage}><div style={styles.messageBubble}>...</div></div>}
            </div>
            <form onSubmit={handleSubmit} style={styles.chatForm}>
              <input
                type="text"
                value={userInput}
                onChange={handleChange}
                placeholder="Type your message..."
                style={styles.chatInput}
              />
              <button type="submit" style={styles.chatSubmit}>Send</button>
            </form>
          </div>
          <button onClick={toggleChatbot} style={styles.closeButton}>X</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  chatbotWrapper: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1000,
    textAlign: 'center',
  },
  chatbotLabel: {
    fontSize: '14px',
    color: '#f8f9fa',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  chatbotButton: {
    backgroundColor: '#6c757d',
    border: 'none',
    borderRadius: '30px',
    padding: '10px 20px',
    color: '#f8f9fa',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
  },
  chatbotButtonHover: {
    transform: 'scale(1.1)',
  },
  chatbotContainer: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '350px',
    backgroundColor: '#343a40',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
  },
  chatMessages: {
    padding: '10px',
    overflowY: 'auto',
    flexGrow: 1,
    maxHeight: '300px',
    color: '#f8f9fa',
  },
  userMessage: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '10px',
  },
  botMessage: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '10px',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: '#495057',
    color: '#f8f9fa',
    wordWrap: 'break-word',
  },
  chatForm: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #495057',
  },
  chatInput: {
    flexGrow: 1,
    padding: '10px',
    border: '1px solid #495057',
    borderRadius: '20px',
    fontSize: '14px',
    backgroundColor: '#6c757d',
    color: '#f8f9fa',
  },
  chatSubmit: {
    backgroundColor: '#17a2b8',
    color: '#f8f9fa',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '20px',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#f8f9fa',
    fontSize: '18px',
    cursor: 'pointer',
  },
};

export default Chatbot;
