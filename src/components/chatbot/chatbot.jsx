import React, { useState } from 'react';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const responses = {
    greeting: "Hey there! 👋 How can I help you with quizzes today?",
    quiz: "To take a quiz, click 'Take a Quiz' on the homepage or dashboard.",
    help: "I'm here to help! You can ask about quiz options, scoring, categories, or how to build your own quizzes.",
    results: "You can view your quiz scores and progress on the dashboard 📊.",
    create: "To create a custom quiz, click on 'Create Quizzes' and fill in your quiz info.",
    default: "Hmm, I didn’t quite get that. Try asking something like 'how do I start a quiz?' or 'how do I create my own?'"
  };

  const keywordMap = {
    greeting: ["hello", "hi", "hey", "yo", "sup"],
    quiz: ["quiz", "start", "take quiz", "play", "question", "test"],
    help: ["help", "assist", "support", "stuck", "issue"],
    results: ["score", "results", "how did i do", "grade", "ranking"],
    create: ["custom", "create", "build", "make quiz"]
  };

  const detectIntent = (input) => {
    for (const intent in keywordMap) {
      if (keywordMap[intent].some(keyword => input.includes(keyword))) {
        return intent;
      }
    }
    return "default";
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
    const lowerInput = userInput.toLowerCase();
    const intent = detectIntent(lowerInput);
    const response = responses[intent] || responses.default;

    setUserInput('');
    setIsLoading(true);

    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: response, intent }]);
      setIsLoading(false);
    }, 800);
  };

  const handleQuickReply = (text) => {
    setUserInput(text);
    setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
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

                  {/* Quick replies for default response */}
                  {message.intent === "default" && message.sender === 'bot' && (
                    <div style={{ paddingLeft: '5px' }}>
                      <button style={styles.quickButton} onClick={() => handleQuickReply("How do I start a quiz?")}>Start Quiz</button>
                      <button style={styles.quickButton} onClick={() => handleQuickReply("How do I create a quiz?")}>Create Quiz</button>
                    </div>
                  )}
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
    flexDirection: 'column',
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
  quickButton: {
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "5px 10px",
    margin: "5px 5px 0 0",
    cursor: "pointer",
    fontSize: "13px",
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
