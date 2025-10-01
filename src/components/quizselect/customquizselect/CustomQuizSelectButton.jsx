/**
 * This component hosts a button to click for each custom quiz
 */
import React, {useState} from "react"
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom"; 

const CustomQuizSelectButton = ({title, numQuestions, tags, uid, quizPassword, creator}) => {

  const { currentUser } = useAuth();
  const navigate = useNavigate()
  const [quizPasswordAttempt, setQuizPasswordAttempt] = useState("")
  // const [quizPasswordAttemptCheck, setQuizPasswordAttemptCheck] = useState()
  // Removed unnecessary creator info fetching since we already get the display name from the backend



  function displayCreatorName() {
    // Use the creator prop directly (it's already the display name from the backend)
    return "Created By: " + (creator || 'Anonymous User');
  }


  function displayTags(tags) {
      if (tags != undefined && tags.length > 0) {
          return "User Tag(s): " + tags
      }
      return;
  }

  const quizPasswordCheck = async (quizPasswordAttempt, quizPassword) => {
      if (!quizPasswordAttempt.trim()) {
          alert("Please enter a password!");
          return;
      }
      
      try {
          // Test password by attempting to fetch the quiz with the password
          const response = await fetch(
              `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${uid}&password=${encodeURIComponent(quizPasswordAttempt)}`
          );
          
          if (!response.ok) {
              if (response.status === 401) {
                  alert("Incorrect password! Please try again.");
              } else {
                  alert("Server error. Please try again later.");
              }
              return;
          }
          
          const result = await response.json();
          
          if (result.result && result.status === 200) {
              // Password correct, navigate to quiz
              navigate('/quizstarted/' + uid, { 
                state: { password: quizPasswordAttempt } 
              });
          } else if (result.requiresPassword) {
              alert("Incorrect password! Please try again.");
          } else {
              alert("Error accessing quiz: " + (result.message || "Unknown error"));
          }
      } catch (error) {
          console.error('Password verification failed:', error);
          alert("Network error. Please check your connection and try again.");
      }
  }

  const handleQuizPasswordChange = (e) => {
      setQuizPasswordAttempt((prevQuizPassword) => {
        let newPassword = prevQuizPassword;
        newPassword = e.target.value;
        console.log(newPassword)
        return newPassword
      })
    }



      return (<div className="w-1/2 p-5 text-center -sm:p-1">
          {quizPassword ? 
          <div className="card rounded-lg shadow-lg hover:shadow-xl border border-accent">
              <div className="text-2xl text-[var(--primary-500)]">{title}</div>
              <div className="text-base">{displayCreatorName()}</div>
              <div className="text-base">{displayTags(tags)}</div>
              <div className="text-base">Questions: {numQuestions}</div>
              <input 
                type="text"
                placeholder='Enter Quiz Password'
                className='text-xl text-black mb-4 bg-gray-300 rounded-md w-full p-1'
                id="quizPasswordAttempt"
                value={quizPasswordAttempt}
                onChange={(e) => handleQuizPasswordChange(e)}
              />
              <div>
                  <button 
                  className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                  onClick={() => quizPasswordCheck(quizPasswordAttempt, quizPassword)}>
                    Start
                  </button>
              </div>
              
          </div>
          :
          <Link to={'/quizstarted/' + uid}>
            <div className="card rounded-lg shadow-lg hover:shadow-xl border border-accent">
              <div className="text-2xl text-[var(--primary-500)]">{title}</div>
              <div className="text-base">{displayCreatorName()}</div>
              <div className="text-base">{displayTags(tags)}</div>
              <div className="text-base">Questions: {numQuestions}</div>
            </div>
          </Link>
          }
          
      </div>
    )
}

export default CustomQuizSelectButton;