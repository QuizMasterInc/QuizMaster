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
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-primary shadow-sm">
            {!isEditingPassword ? (
              <>
                <div className="text-sm font-semibold text-primary">Quiz Password</div>
                <div className="mt-2 text-base break-all text-primary">
                  {storedQuizPassword
                    ? (showStoredPassword ? storedQuizPassword : "••••••••")
                    : "No password set"}
                </div>
                <div className="mt-3 flex gap-2 justify-center flex-wrap">
                  {storedQuizPassword ? (
                    <button
                      className="px-3 py-1 rounded-lg border border-[var(--primary-300)] bg-[var(--primary-100)] text-[var(--primary-500)] transition hover:bg-[var(--primary-200)]"
                      onClick={() => setShowStoredPassword((prev) => !prev)}
                    >
                      {showStoredPassword ? "Hide" : "Show"}
                    </button>
                  ) : null}
                  <button
                    className="px-3 py-1 rounded-lg border border-[var(--primary-500)] bg-[var(--primary-400)] text-white transition hover:bg-[var(--primary-500)]"
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
                <div className="text-sm font-semibold text-primary">Edit Password</div>
                <input
                  type="text"
                  autoComplete="off"
                  value={editedQuizPassword}
                  onChange={(e) => setEditedQuizPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-base text-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Enter new quiz password"
                />
                <div className="mt-3 flex gap-2 justify-center flex-wrap">
                  <button
                    className="px-3 py-1 rounded-lg border border-[var(--primary-500)] bg-[var(--primary-400)] text-white transition hover:bg-[var(--primary-500)]"
                    onClick={handleSaveQuizPassword}
                    disabled={isSavingPassword}
                  >
                    {isSavingPassword ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="px-3 py-1 rounded-lg border border-primary bg-[var(--bg-card)] text-primary transition hover:bg-[var(--bg-secondary)]"
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
                    className="mt-3 px-3 py-1 rounded-lg border border-red-400 bg-[rgba(239,68,68,0.12)] text-red-600 transition hover:bg-[rgba(239,68,68,0.2)]"
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
    <div className="w-full text-center">
      {quizPassword && !isCreator ? (
        <div className="card relative rounded-2xl shadow-lg hover:shadow-xl border border-[var(--border)] h-full flex flex-col transition-all duration-200">
          <div className="p-6 flex-grow flex flex-col text-center">
            <div className="text-2xl text-[var(--accent)] font-bold mb-3">{title}</div>
            <div className="text-sm text-[var(--text-secondary)] mb-3">{renderCreatorName()}</div>
            <div className="space-y-2 mb-4">
              {displayTags(tags) ? <div className="text-sm text-[var(--text-secondary)]">{displayTags(tags)}</div> : null}
              <div className="text-base text-[var(--text-secondary)]">Questions: {numQuestions}</div>
            </div>
            <input
              type="text"
              autoComplete="off"
              placeholder="Enter Quiz Password"
              className="w-full px-4 py-3 rounded-lg bg-transparent text-primary border border-[var(--border)] mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              id="quizPasswordAttempt"
              value={quizPasswordAttempt}
              onChange={handleQuizPasswordChange}
            />
            <button
              className="w-full px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => quizPasswordCheck(quizPasswordAttempt)}
            >
              Start
            </button>
          </div>
          <div className="p-4 border-t border-[var(--border)]">
            <DeleteQuizButton
              quizId={uid}
              creatorId={creatorId}
              currentUserId={currentUserId}
              onDeleted={onDeleted}
            />
          </div>
        </div>
      ) : (
        <div className="card relative rounded-2xl shadow-lg hover:shadow-xl border border-[var(--border)] h-full flex flex-col transition-all duration-200">
          {quizPassword && isCreator ? (
            <>
              <div className="p-6 flex-grow flex flex-col text-center">
                <div className="text-2xl text-[var(--accent)] font-bold mb-3 cursor-pointer" onClick={handleCreatorStart}>{title}</div>
                <div className="text-sm text-[var(--text-secondary)] mb-3">{renderCreatorName()}</div>
                <div className="space-y-2 mb-4">
                  {displayTags(tags) ? <div className="text-sm text-[var(--text-secondary)]">{displayTags(tags)}</div> : null}
                  <div className="text-base text-[var(--text-secondary)]">Questions: {numQuestions}</div>
                </div>
                <button
                  className="w-full px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={handleCreatorStart}
                >
                  Start
                </button>
                {renderPasswordManager()}
              </div>
            </>
          ) : (
            <>
              <div className="p-6 flex-grow flex flex-col text-center">
                <Link to={'/customquiz/settings/' + uid} state={{ from: location.pathname }}>
                  <div className="text-2xl text-[var(--accent)] font-bold mb-3">{title}</div>
                </Link>
                <div className="text-sm text-[var(--text-secondary)] mb-3">
                  {linkCreatorToProfile && creatorId ? (
                    <>
                      Created by:{" "}
                      <Link to={getCreatorProfilePath()} className="text-[var(--accent)] hover:underline">
                        {getCreatorLabel()}
                      </Link>
                    </>
                  ) : (
                    renderCreatorName()
                  )}
                </div>
                <Link to={'/customquiz/settings/' + uid} state={{ from: location.pathname }}>
                  <div className="space-y-2 mb-4">
                    {displayTags(tags) ? <div className="text-sm text-[var(--text-secondary)]">{displayTags(tags)}</div> : null}
                    <div className="text-base text-[var(--text-secondary)]">Questions: {numQuestions}</div>
                  </div>
                </Link>
                {renderPasswordManager()}
              </div>
            </>
          )}
          <div className="p-4 border-t border-[var(--border)]">
            <DeleteQuizButton
              quizId={uid}
              creatorId={creatorId}
              currentUserId={currentUserId}
              onDeleted={onDeleted}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomQuizSelectButton;