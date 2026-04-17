import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DeleteQuizButton from "./DeleteQuizButton";
import { collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
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
  const [showPasswordManager, setShowPasswordManager] = useState(false);
  const [showStoredPassword, setShowStoredPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [storedQuizPassword, setStoredQuizPassword] = useState(quizPassword || "");
  const [editedQuizPassword, setEditedQuizPassword] = useState(quizPassword || "");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const isCreator = currentUserId && creatorId && currentUserId === creatorId;
  const showOwnerPasswordTools = isCreator && location.pathname === "/myquizzes";

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

  useEffect(() => {
    const nextPassword = quizPassword || "";
    setStoredQuizPassword(nextPassword);
    setEditedQuizPassword(nextPassword);
  }, [quizPassword]);

  useEffect(() => {
    let cancelled = false;

    async function loadOwnerPassword() {
      if (!showOwnerPasswordTools || !uid) return;

      try {
        const quizRef = doc(db, "custom_quizzes", uid);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists() || cancelled) return;

        const data = quizSnap.data() || {};
        const actualPassword = data?.metadata?.password || "";

        if (!cancelled) {
          setStoredQuizPassword(actualPassword);
          setEditedQuizPassword(actualPassword);
        }
      } catch (error) {
        console.error("Failed to load owner quiz password:", error);
      }
    }

    loadOwnerPassword();

    return () => {
      cancelled = true;
    };
  }, [showOwnerPasswordTools, uid]);

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
  };

  const handleSaveQuizPassword = async () => {
    const trimmedPassword = editedQuizPassword.trim();

    try {
      setIsSavingPassword(true);

      await updateDoc(doc(db, "custom_quizzes", uid), {
        "metadata.password": trimmedPassword,
        "metadata.hasPassword": Boolean(trimmedPassword),
      });

      setStoredQuizPassword(trimmedPassword);
      setEditedQuizPassword(trimmedPassword);
      setShowStoredPassword(Boolean(trimmedPassword));
      setShowPasswordManager(true);
      setIsEditingPassword(false);
      toast.success(trimmedPassword ? "Quiz password updated!" : "Quiz password removed!");
    } catch (error) {
      console.error("Failed to update quiz password:", error);
      toast.error("Failed to update quiz password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const renderPasswordManager = () => {
    if (!showOwnerPasswordTools) return null;

    return (
      <div className="mt-3">
        <button
          className="inline-block px-4 py-1 rounded-lg font-medium text-white bg-[linear-gradient(90deg,#7c3aed,#8b5cf6)] border border-[#a78bfa] shadow-md hover:opacity-90 transition"
          onClick={() => {
            setShowPasswordManager((prev) => {
              const nextOpen = !prev;
              setShowStoredPassword(nextOpen && Boolean(storedQuizPassword));
              return nextOpen;
            });
            setIsEditingPassword(false);
          }}
        >
          View / Edit Password
        </button>

        {showPasswordManager ? (
          <div className="mt-3 p-4 rounded-xl bg-[rgba(20,20,28,0.95)] border border-[var(--primary-400)] text-white shadow-lg backdrop-blur-sm">
            {!isEditingPassword ? (
              <>
                <div className="text-sm font-semibold">Quiz Password</div>
                <div className="mt-2 text-base break-all">
                  {storedQuizPassword
                    ? (showStoredPassword ? storedQuizPassword : "••••••••")
                    : "No password set"}
                </div>
                <div className="mt-3 flex gap-2 justify-center flex-wrap">
                  {storedQuizPassword ? (
                    <button
                      className="px-3 py-1 rounded-md bg-[rgba(99,102,241,0.2)] text-[#c4b5fd] border border-[#8b5cf6] hover:bg-[rgba(99,102,241,0.32)] transition"
                      onClick={() => setShowStoredPassword((prev) => !prev)}
                    >
                      {showStoredPassword ? "Hide" : "Show"}
                    </button>
                  ) : null}
                  <button
                    className="px-3 py-1 rounded-md bg-[rgba(139,92,246,0.22)] text-[#f5f3ff] border border-[#a78bfa] hover:bg-[rgba(139,92,246,0.34)] transition"
                    onClick={() => {
                      setEditedQuizPassword(storedQuizPassword);
                      setIsEditingPassword(true);
                    }}
                  >
                    {storedQuizPassword ? "✏️ Edit" : "+ Add Password"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold">Edit Password</div>
                <input
                  type="text"
                  autoComplete="off"
                  value={editedQuizPassword}
                  onChange={(e) => setEditedQuizPassword(e.target.value)}
                  className="text-xl text-black mt-2 bg-white rounded-md w-full p-1 border"
                  placeholder="Enter new quiz password"
                />
                <div className="mt-3 flex gap-2 justify-center flex-wrap">
                  <button
                    className="px-3 py-1 rounded-md bg-[linear-gradient(90deg,#7c3aed,#8b5cf6)] text-white border border-[#a78bfa] hover:opacity-90 transition"
                    onClick={handleSaveQuizPassword}
                    disabled={isSavingPassword}
                  >
                    {isSavingPassword ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.08)] text-[#e9d5ff] border border-[#8b5cf6] hover:bg-[rgba(255,255,255,0.14)] transition"
                    onClick={() => {
                      setEditedQuizPassword(storedQuizPassword);
                      setIsEditingPassword(false);
                    }}
                    disabled={isSavingPassword}
                  >
                    Cancel
                  </button>
                </div>
                {storedQuizPassword ? (
                  <button
                    className="mt-3 px-3 py-1 rounded-md bg-[rgba(190,24,93,0.18)] text-[#fbcfe8] border border-[#ec4899] hover:bg-[rgba(190,24,93,0.28)] transition"
                    onClick={() => setEditedQuizPassword("")}
                    disabled={isSavingPassword}
                  >
                    Remove Password
                  </button>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  };

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
              {renderPasswordManager()}
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
              {renderPasswordManager()}
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