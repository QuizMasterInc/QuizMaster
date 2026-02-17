/**
 * CustomQuizSelectButton
 * ----------------------
 * Renders a card + button UI for a single custom quiz in the "User-Made Quizzes" list.
 *
 * RESPONSIBILITIES:
 *  - Display quiz metadata (title, creator name, tags, question count).
 *  - Handle optional password-protected quizzes by prompting for a password
 *    and validating it via the grabCustomQuiz Cloud Function before navigation.
 *  - Render the DeleteQuizButton, which allows the quiz owner to delete their quiz
 *    (non-owners will not see the delete control).
 *
 * PROPS:
 *  - title: string            -> Quiz title.
 *  - numQuestions: number     -> Count of questions in the quiz.
 *  - tags: string | string[]  -> User-entered tag(s) for the quiz.
 *  - uid: string              -> Quiz document ID used for navigation and API calls.
 *  - quizPassword: string?    -> If present, quiz is password-protected.
 *  - creator: string?         -> Display name of the quiz creator (from backend).
 *  - creatorUsername: string?  -> Username/handle of the quiz creator (when available).
 *  - creatorId: string        -> UID of the quiz creator (used for delete permissions).
 *  - currentUserId: string    -> UID of the currently logged-in user.
 *  - onDeleted: function      -> Callback invoked when the quiz is successfully deleted.
 */

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import DeleteQuizButton from "./DeleteQuizButton";

const CustomQuizSelectButton = ({
  title,
  numQuestions,
  tags,
  uid,
  quizPassword,
  creator,
  creatorUsername,
  creatorId,
  currentUserId,
  onDeleted
}) => {

  const navigate = useNavigate();
  const location = useLocation();
  const [quizPasswordAttempt, setQuizPasswordAttempt] = useState("");

  function displayCreatorName() {
    if (typeof creatorUsername === 'string' && creatorUsername.trim()) {
      return "Created by: @" + creatorUsername.replace(/^@/, '');
    }
    return "Created by: " + (creator || 'Anonymous User');
  }

  function displayTags(tags) {
    if (tags !== undefined && tags !== null && tags.length > 0) {
      return "User Tag(s): " + tags;
    }
    return null;
  }

  const quizPasswordCheck = async (quizPasswordAttempt, quizPassword) => {
      if (!quizPasswordAttempt.trim()) {
          alert("Please enter a password!");
          return;
      }
      
      try {
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
              navigate('/customquiz/settings/' + uid, { 
                state: { 
                  password: quizPasswordAttempt,
                  from: location.pathname
                } 
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
        return newPassword
      })
    }

      return (<div className="w-1/2 p-5 text-center -sm:p-1">
          {quizPassword ? 
          <div className="card relative rounded-lg shadow-lg hover:shadow-xl border border-accent">
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
              <DeleteQuizButton
                quizId={uid}
                creatorId={creatorId}
                currentUserId={currentUserId}
                onDeleted={onDeleted}
              />
          </div>
          :
          <div className="card relative rounded-lg shadow-lg hover:shadow-xl border border-accent">
            <Link to={'/customquiz/settings/' + uid} state={{ from: location.pathname }}>
              <div className="text-2xl text-[var(--primary-500)]">{title}</div>
              <div className="text-base">{displayCreatorName()}</div>
              <div className="text-base">{displayTags(tags)}</div>
              <div className="text-base">Questions: {numQuestions}</div>
            </Link>
            <DeleteQuizButton
              quizId={uid}
              creatorId={creatorId}
              currentUserId={currentUserId}
              onDeleted={onDeleted}
            />
          </div>
          }
          
      </div>
    )
}

export default CustomQuizSelectButton;