import React, { useState } from 'react';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const responses = {
    greeting: "Hello! How can I assist you today?",
    quiz: "You can start using this app by pressing the take a quiz button to then see the quiz options we provide.",
    difficulty: "We offer multiple difficulty levels for quizzes which you can choose. You can find them while customizing your quiz settings.",
    categories: "We have various categories of quizzes, such as math, science, history, sports etc. You will see them after selecting take a quiz.",
    startQuiz: "Click on 'Start' to begin once you've selected your quiz and set the settings you want.",
    quizTimer: "Some quizzes have a timer and you can choose to set one; there is also an option to hide it.",
    results: "Once you've completed a quiz, you can view your results as they will pop up immediately.",
    score: "You can check your score after you submit each quiz, along with the correct answers.",
    progress: "Your progress is not going to be saved, so you need to submit before leaving.",
    difficultyLevels: "You can choose from difficulty levels using the range of 1-5 stars depending on your preference.",
    help: "I'm here to help! You can ask me about quizzes, categories, difficulty levels, quiz results, and more.",
    settings: "You can adjust settings such as volume, contrast, and other preferences in the settings page.",
    feedback: "We'd love to hear your feedback! Please visit the contact page to leave your comments.",
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
    } else if (/(difficulty|difficulty levels|stars)/.test(lowerInput)) {
      response = responses.difficulty;
    } else if (/(category|categories|topics)/.test(lowerInput)) {
      response = responses.categories;
    } else if (/(start.*quiz|take.*quiz)/.test(lowerInput)) {
      response = responses.startQuiz;
    } else if (/(timer|time limit)/.test(lowerInput)) {
      response = responses.quizTimer;
    } else if (/(results|score)/.test(lowerInput)) {
      response = responses.results;
    } else if (/(progress|track.*progress)/.test(lowerInput)) {
      response = responses.progress;
    } else if (/(difficulty levels)/.test(lowerInput)) {
      response = responses.difficultyLevels;
    } else if (/(help|assist|support)/.test(lowerInput)) {
      response = responses.help;
    } else if (/(settings|preferences)/.test(lowerInput)) {
      response = responses.settings;
    } else if (/(feedback|suggestions)/.test(lowerInput)) {
      response = responses.feedback;
    }

    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: response }]);
      setIsLoading(false);
      document.getElementById('chat-input').focus();
    }, 1000);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {!isOpen && (
        <button onClick={toggleChatbot} style={styles.chatbotButton}>
          Chatbot
        </button>
      )}

      {isOpen && (
        <div style={styles.chatbotContainer}>
          <div style={styles.chatWindow}>
            <div style={styles.chatMessages}>
              {messages.map((message, index) => (
                <div key={index} style={message.sender === 'user' ? styles.userMessage : styles.botMessage}>
                  <div style={styles.messageBubble}>{message.text}</div>
                </div>
              ))}
              {isLoading && <div style={styles.botMessage}><div style={styles.messageBubble}>...</div></div>}
            </div>
            <form onSubmit={handleSubmit} style={styles.chatForm}>
              <input
                id="chat-input"
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
  chatbotButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#3b8d99',
    border: 'none',
    borderRadius: '50%',
    padding: '15px 25px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    zIndex: 1000
  },
  chatbotContainer: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '300px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    overflow: 'hidden'
  },
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px'
  },
  chatMessages: {
    padding: '10px',
    overflowY: 'auto',
    flexGrow: 1,
    maxHeight: '300px'
  },
  userMessage: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '10px'
  },
  botMessage: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '10px'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px',
    borderRadius: '15px',
    backgroundColor: '#f1f1f1',
    wordWrap: 'break-word'
  },
  chatForm: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd'
  },
  chatInput: {
    flexGrow: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    fontSize: '14px'
  },
  chatSubmit: {
    backgroundColor: '#3b8d99',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '50%',
    marginLeft: '10px',
    cursor: 'pointer'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer'
  }
};

export default Chatbot;