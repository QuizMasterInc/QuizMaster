/**
 * CustomQuizSelectButton
 * ----------------------
 * Renders a card + button UI for a single custom quiz in the "User-Made Quizzes" list.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DeleteQuizButton from "./DeleteQuizButton";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseService";

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
  const [resolvedCreatorUsername, setResolvedCreatorUsername] = useState(null);

  // If backend didn't include creatorUsername, fetch it from users/{creatorId}
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const provided = typeof creatorUsername === 'string' ? creatorUsername.trim() : '';
        if (provided) return;

        const uidToLookup = creatorId;
        if (!uidToLookup) return;

        const snap = await getDoc(doc(db, "users", uidToLookup));
        if (!snap.exists() || cancelled) return;

        const data = snap.data();
        const uname = data?.username || data?.profile?.username;
        if (!cancelled && typeof uname === 'string' && uname.trim()) {
          setResolvedCreatorUsername(uname.trim());
        }
      } catch (e) {
        // ignore and fall back
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [creatorUsername, creatorId]);

  function displayCreatorName() {
    const effective = (
      (typeof creatorUsername === 'string' && creatorUsername.trim() ? creatorUsername.trim() : '') ||
      (typeof resolvedCreatorUsername === 'string' && resolvedCreatorUsername.trim() ? resolvedCreatorUsername.trim() : '')
    );

    if (effective) {
      return "Created by: @" + effective.replace(/^@/, '');
    }

    return "Created by: " + (creator || 'Anonymous User');
  }

  function displayTags(tagsValue) {
    if (tagsValue !== undefined && tagsValue !== null && String(tagsValue).length > 0) {
      return "User Tag(s): " + tagsValue;
    }
    return null;
  }

  const quizPasswordCheck = async (attempt) => {
    if (!attempt.trim()) {
      alert("Please enter a password!");
      return;
    }

    try {
      const response = await fetch(
        `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${uid}&password=${encodeURIComponent(attempt)}`
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
            password: attempt,
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
    setQuizPasswordAttempt(e.target.value);
  }

  return (
    <div className="w-1/2 p-5 text-center -sm:p-1">
      {quizPassword ? (
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
            onChange={handleQuizPasswordChange}
          />
          <div>
            <button
              className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
              onClick={() => quizPasswordCheck(quizPasswordAttempt)}
            >
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
      ) : (
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
      )}
    </div>
  );
}

export default CustomQuizSelectButton;