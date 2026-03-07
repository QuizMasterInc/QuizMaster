/**
 * CustomQuizSelectButton
 * ----------------------
 * Renders a card + button UI for a single custom quiz in the "User-Made Quizzes" list.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DeleteQuizButton from "./DeleteQuizButton";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseService";
import { toast } from 'react-toastify';

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
  linkCreatorToProfile = false,
  onDeleted
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizPasswordAttempt, setQuizPasswordAttempt] = useState("");
  const [resolvedCreatorUsername, setResolvedCreatorUsername] = useState(null);

  // If backend didn't include creatorUsername, fetch it from the usernames registry (query by uid)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // If the parent already provided a username, we don't need a query.
        const provided = typeof creatorUsername === 'string' ? creatorUsername.trim() : '';
        if (provided) {
          if (!cancelled) setResolvedCreatorUsername(null);
          return;
        }

        const uidToLookup = creatorId;
        if (!uidToLookup) {
          if (!cancelled) setResolvedCreatorUsername(null);
          return;
        }

        // Query usernames where uid == creatorId (Option 1)
        const q = query(
          collection(db, "usernames"),
          where("uid", "==", uidToLookup),
          limit(1)
        );

        const snap = await getDocs(q);
        if (cancelled) return;

        if (snap.empty) {
          setResolvedCreatorUsername(null);
          return;
        }

        const docSnap = snap.docs[0];
        const data = docSnap.data() || {};

        // Prefer explicit username field; fall back to doc id (usually usernameLower)
        const uname = (data.username || docSnap.id || "").toString().trim();
        setResolvedCreatorUsername(uname ? uname : null);
      } catch (e) {
        if (!cancelled) setResolvedCreatorUsername(null);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [creatorUsername, creatorId]);

  function getCreatorLabel() {
    const effective = (
      (typeof resolvedCreatorUsername === 'string' && resolvedCreatorUsername.trim() ? resolvedCreatorUsername.trim() : '') ||
      (typeof creatorUsername === 'string' && creatorUsername.trim() ? creatorUsername.trim() : '')
    );

    // 1) Prefer resolved/provided username
    if (effective) {
      return "@" + effective.replace(/^@/, '');
    }

    // 2) Fall back to creator object fields (and avoid rendering an object)
    if (creator && typeof creator === 'object') {
      const handle = typeof creator.handle === 'string' ? creator.handle.trim() : '';
      if (handle) return handle.startsWith('@') ? handle : `@${handle}`;

      const uname = typeof creator.username === 'string' ? creator.username.trim() : '';
      if (uname) return "@" + uname.replace(/^@/, '');
    }

    // 3) If creator was a string, use it
    if (typeof creator === 'string' && creator.trim()) {
      return creator.trim();
    }

    // 4) Last resort
    return "Anonymous";
  }

  function getCreatorProfilePath() {
    const creatorLabel = getCreatorLabel();
    const username = typeof creatorLabel === 'string' ? creatorLabel.trim().replace(/^@/, '') : '';

    if (username) {
      return `/u/${username}`;
    }

    if (creatorId) {
      return `/user/${creatorId}`;
    }

    return null;
  }

  function renderCreatorName() {
    const creatorLabel = getCreatorLabel();
    const creatorProfilePath = getCreatorProfilePath();

    if (linkCreatorToProfile && creatorProfilePath) {
      return (
        <>
          Created by:{" "}
          <Link to={creatorProfilePath} className="text-[var(--primary-400)] hover:underline">
            {creatorLabel}
          </Link>
        </>
      );
    }

    return <>Created by: {creatorLabel}</>;
  }

  function displayTags(tagsValue) {
    if (tagsValue !== undefined && tagsValue !== null && String(tagsValue).length > 0) {
      return "User Tag(s): " + tagsValue;
    }
    return null;
  }

  const quizPasswordCheck = async (attempt) => {
    if (!attempt.trim()) {
      toast.warn("Please enter a password!");
      return;
    }

    try {
      const response = await fetch(
        `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${uid}&password=${encodeURIComponent(attempt)}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Incorrect password! Please try again.");
        } else {
          toast.error("Server error. Please try again later.");
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
        toast.error("Incorrect password! Please try again.");
      } else {
        toast.error("Error accessing quiz: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error('Password verification failed:', error);
      toast.error("Network error. Please check your connection and try again.");
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
          <div className="text-base">{renderCreatorName()}</div>
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
          </Link>
          <div className="text-base">
            {linkCreatorToProfile && creatorId ? (
              <>
                Created by:{" "}
                <Link to={getCreatorProfilePath()} className="text-[var(--primary-400)] hover:underline">
                  {getCreatorLabel()}
                </Link>
              </>
            ) : (
              renderCreatorName()
            )}
          </div>
          <Link to={'/customquiz/settings/' + uid} state={{ from: location.pathname }}>
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