import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DeleteQuizButton from "./DeleteQuizButton";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseService";
import { useAuth } from "../../../contexts/AuthContext";
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
  const { currentUser } = useAuth();
  const [quizPasswordAttempt, setQuizPasswordAttempt] = useState("");
  const [resolvedCreatorUsername, setResolvedCreatorUsername] = useState(null);

  const isCreator = currentUserId && creatorId && currentUserId === creatorId;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
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

    if (effective) {
      return "@" + effective.replace(/^@/, '');
    }

    if (creator && typeof creator === 'object') {
      const handle = typeof creator.handle === 'string' ? creator.handle.trim() : '';
      if (handle) return handle.startsWith('@') ? handle : `@${handle}`;

      const uname = typeof creator.username === 'string' ? creator.username.trim() : '';
      if (uname) return "@" + uname.replace(/^@/, '');
    }

    if (typeof creator === 'string' && creator.trim()) {
      return creator.trim();
    }

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
      const headers = {};
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenErr) {
          console.warn('Failed to get auth token:', tokenErr.message);
        }
      }

      const response = await fetch(
        `https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${uid}&password=${encodeURIComponent(attempt)}`,
        { headers }
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

  const handleCreatorStart = () => {
    navigate('/customquiz/settings/' + uid, {
      state: { from: location.pathname }
    });
  };

  const handleQuizPasswordChange = (e) => {
    setQuizPasswordAttempt(e.target.value);
  }

  return (
    <div className="w-1/2 p-5 text-center -sm:p-1">
      {quizPassword && !isCreator ? (
        <div className="card relative rounded-lg shadow-lg hover:shadow-xl border border-accent">
          <div className="text-2xl text-[var(--primary-500)]">{title}</div>
          <div className="text-base">{renderCreatorName()}</div>
          <div className="text-base">{displayTags(tags)}</div>
          <div className="text-base">Questions: {numQuestions}</div>
          <input
            type="text"
            autoComplete="off"
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
          {quizPassword && isCreator ? (
            <>
              <div className="text-2xl text-[var(--primary-500)] cursor-pointer" onClick={handleCreatorStart}>{title}</div>
              <div className="text-base">{renderCreatorName()}</div>
              <div className="text-base">{displayTags(tags)}</div>
              <div className="text-base">Questions: {numQuestions}</div>
              <div>
                <button
                  className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                  onClick={handleCreatorStart}
                >
                  Start
                </button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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