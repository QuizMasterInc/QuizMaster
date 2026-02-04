import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  closePoll,
  createPoll,
  findPollByCode,
  openPoll,
  setShowLiveResults,
  submitVote,
  subscribeToPoll,
} from "../services/polls/pollService";

const localVoteKey = (pollId) => `voted:${pollId}`;

const defaultQuestion = "Which topic should we review next?";
const defaultOptions = [
  "Probability & statistics warm-up",
  "Regression vs classification overview",
  "Overfitting and regularization demo",
  "Gradient descent intuition",
];

export default function Poll() {
  const { currentUser } = useAuth();

  const [teacherQuestion, setTeacherQuestion] = useState(defaultQuestion);
  const [teacherOptions, setTeacherOptions] = useState(defaultOptions);
  const [currentPollId, setCurrentPollId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [pollData, setPollData] = useState(null);
  const [teacherError, setTeacherError] = useState("");
  const [studentError, setStudentError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [studentJoinCode, setStudentJoinCode] = useState("");
  const [studentSelection, setStudentSelection] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const unsubscribeRef = useRef(null);

  const totalVotes = useMemo(
    () => (pollData?.votes || []).reduce((sum, v) => sum + v, 0),
    [pollData]
  );

  const resultsVisible =
    pollData?.status === "closed" || pollData?.showLiveResults === true;

  const isCreator = !!(
    currentUser?.uid &&
    pollData?.createdBy &&
    pollData.createdBy === currentUser.uid
  );

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const resetSubscription = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  };

  const attachListener = (pollId) => {
    resetSubscription();
    unsubscribeRef.current = subscribeToPoll(pollId, (payload, error) => {
      if (error) {
        setStudentError(error.message || "Realtime update failed.");
        return;
      }
      if (!payload) {
        setStudentError("Poll was removed or is unavailable.");
        setPollData(null);
        return;
      }
      setPollData(payload.data);
      const storedVote = localStorage.getItem(localVoteKey(pollId));
      setHasSubmitted(!!storedVote);
    });
  };

  const handleStartPoll = async () => {
    setTeacherError("");
    setInfoMessage("");

    // NEW: creation requires auth (creator-only controls rely on createdBy)
    if (!currentUser?.uid) {
      setTeacherError("You must be signed in to create a poll.");
      return;
    }

    try {
      const trimmedQuestion = teacherQuestion.trim();
      const cleanedOptions = teacherOptions.map((opt) => opt.trim()).filter(Boolean);

      if (!trimmedQuestion) {
        setTeacherError("Please enter a question.");
        return;
      }
      if (cleanedOptions.length < 2 || cleanedOptions.length > 6) {
        setTeacherError("Enter between 2 and 6 options.");
        return;
      }

      setIsCreating(true);

      // NEW: pass createdBy to comply with Firestore rules
      const { id, joinCode: code } = await createPoll({
        question: trimmedQuestion,
        options: cleanedOptions,
        createdBy: currentUser.uid,
      });

      setCurrentPollId(id);
      setJoinCode(code);
      setHasSubmitted(false);
      setStudentSelection(null);
      setStudentJoinCode(code);
      setInfoMessage("Poll started. Share the join code with students.");
      attachListener(id);
    } catch (error) {
      setTeacherError(error.message || "Failed to start poll.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinPoll = async () => {
    setStudentError("");
    setInfoMessage("");
    try {
      const code = studentJoinCode.trim();
      if (!code) {
        setStudentError("Enter a join code.");
        return;
      }
      setIsJoining(true);
      const found = await findPollByCode(code);
      if (!found) {
        setStudentError("No poll found with that code.");
        setPollData(null);
        setCurrentPollId(null);
        resetSubscription();
        return;
      }
      setCurrentPollId(found.id);
      setJoinCode(code);
      setHasSubmitted(!!localStorage.getItem(localVoteKey(found.id)));
      setStudentSelection(null);
      attachListener(found.id);
    } catch (error) {
      setStudentError(error.message || "Unable to join poll.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!currentPollId || studentSelection === null) return;
    try {
      await submitVote(currentPollId, studentSelection);
      localStorage.setItem(localVoteKey(currentPollId), String(studentSelection));
      setHasSubmitted(true);
    } catch (error) {
      setStudentError(error.message || "Failed to submit vote.");
    }
  };

  const handleClosePoll = async () => {
    if (!currentPollId) return;
    try {
      await closePoll(currentPollId);
    } catch (error) {
      setTeacherError(error.message || "Failed to close poll.");
    }
  };

  const handleOpenPoll = async () => {
    if (!currentPollId) return;
    try {
      await openPoll(currentPollId);
    } catch (error) {
      setTeacherError(error.message || "Failed to reopen poll.");
    }
  };

  const handleToggleLiveResults = async () => {
    if (!currentPollId) return;
    try {
      await setShowLiveResults(
        currentPollId,
        !(pollData?.showLiveResults ?? false)
      );
    } catch (error) {
      setTeacherError(error.message || "Could not update visibility.");
    }
  };

  const pollQuestion = pollData?.question || teacherQuestion;
  const pollOptions = pollData?.options || teacherOptions;
  const votes = pollData?.votes || pollOptions.map(() => 0);

  return (
    <div className="min-h-screen bg-primary text-primary px-6 py-16">
      <div className="max-w-5xl mx-auto bg-card border border-accent rounded-3xl shadow-xl p-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-secondary font-semibold">
              Sneak peek
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gradient-primary mt-2">
              Take a Poll
            </h1>
            <p className="text-lg text-secondary mt-3 max-w-3xl">
              Live classroom polling preview—create a poll, share a code, vote once, and reveal results in real time.
            </p>
          </div>
          <div className="text-sm bg-primary/40 text-secondary border border-accent px-4 py-2 rounded-full">
            {currentPollId ? `Total votes: ${totalVotes}` : "Waiting to start"}
          </div>
        </div>

        {infoMessage && (
          <div className="mt-4 p-3 rounded-xl border border-accent text-sm text-primary bg-primary/60">
            {infoMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 mt-10">
          <CreatePollPanel
            isCreator={isCreator}
            isSignedIn={!!currentUser?.uid}
            question={teacherQuestion}
            options={teacherOptions}
            setQuestion={setTeacherQuestion}
            setOptions={setTeacherOptions}
            onStart={handleStartPoll}
            onClose={handleClosePoll}
            onOpen={handleOpenPoll}
            onToggleLive={handleToggleLiveResults}
            poll={pollData}
            joinCode={joinCode}
            isCreating={isCreating}
            error={teacherError}
          />

          <StudentPanel
            joinCodeInput={studentJoinCode}
            setJoinCodeInput={setStudentJoinCode}
            onJoin={handleJoinPoll}
            isJoining={isJoining}
            poll={pollData}
            totalVotes={totalVotes}
            options={pollOptions}
            votes={votes}
            selected={studentSelection}
            setSelected={setStudentSelection}
            hasSubmitted={hasSubmitted}
            resultsVisible={resultsVisible}
            onSubmit={handleSubmitVote}
            error={studentError}
            currentPollId={currentPollId}
          />
        </div>

        <ResultsSection
          pollQuestion={pollQuestion}
          options={pollOptions}
          votes={votes}
          totalVotes={totalVotes}
          resultsVisible={resultsVisible}
          status={pollData?.status}
        />

        <div className="mt-10 p-4 rounded-2xl border border-dashed border-accent text-sm text-secondary bg-primary/50">
          This demo uses Firestore for realtime syncing and localStorage to keep votes one-per-device.
          In production, we&apos;d add authentication, stronger vote validation, and role-based controls.
        </div>
      </div>
    </div>
  );
}

function CreatePollPanel({
  isCreator,
  isSignedIn,
  question,
  options,
  setQuestion,
  setOptions,
  onStart,
  onClose,
  onOpen,
  onToggleLive,
  poll,
  joinCode,
  isCreating,
  error,
}) {
  const handleOptionChange = (value, idx) => {
    const next = [...options];
    next[idx] = value;
    setOptions(next);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const removeOption = (idx) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-2xl border border-accent bg-primary/60 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-gradient-primary">Create a poll</h2>
        <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold">
          {poll?.status ? poll.status.toUpperCase() : "IDLE"}
        </span>
      </div>
      <p className="text-secondary mt-2">
        Create a poll, share the join code, and manage visibility. Options: 2–6.
        {!isSignedIn && (
          <>
            {" "}
            <span className="text-accent font-semibold">
              Sign in required to start a poll.
            </span>
          </>
        )}
      </p>

      <div className="mt-4 space-y-3">
        <label className="text-sm font-semibold text-secondary block">Question</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-accent bg-primary/80 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={opt}
                onChange={(e) => handleOptionChange(e.target.value, idx)}
                className="flex-1 px-4 py-2 rounded-xl border border-accent bg-primary/80 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder={`Option ${idx + 1}`}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(idx)}
                  className="text-xs px-3 py-2 rounded-full border border-accent text-secondary hover:text-accent transition"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={addOption}
            disabled={options.length >= 6}
            className={`px-3 py-2 rounded-full text-sm font-semibold border border-accent transition ${
              options.length >= 6
                ? "text-secondary border-accent/50 cursor-not-allowed"
                : "text-accent hover:-translate-y-0.5"
            }`}
          >
            Add option
          </button>

          <button
            onClick={onStart}
            disabled={isCreating || !isSignedIn}
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition-transform duration-200 ${
              isCreating || !isSignedIn
                ? "bg-primary/50 text-secondary border border-accent/50 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:-translate-y-0.5"
            }`}
            title={!isSignedIn ? "Sign in to start a poll" : undefined}
          >
            {isCreating ? "Starting..." : "Start poll"}
          </button>

          <button
            onClick={onClose}
            disabled={!poll || poll.status === "closed" || !isCreator}
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition ${
              poll && poll.status !== "closed" && isCreator
                ? "bg-primary text-accent border border-accent hover:-translate-y-0.5"
                : "bg-primary/50 text-secondary border border-accent/50 cursor-not-allowed"
            }`}
            title={!isCreator && poll ? "Only the poll creator can close the poll" : undefined}
          >
            Close poll
          </button>

          <button
            onClick={onOpen}
            disabled={!poll || poll.status === "open" || !isCreator}
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition ${
              poll && poll.status === "closed" && isCreator
                ? "bg-primary text-accent border border-accent hover:-translate-y-0.5"
                : "bg-primary/50 text-secondary border border-accent/50 cursor-not-allowed"
            }`}
            title={!isCreator && poll ? "Only the poll creator can reopen the poll" : undefined}
          >
            Reopen
          </button>

          <button
            onClick={onToggleLive}
            disabled={!poll || !isCreator}
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition ${
              poll && isCreator
                ? "bg-primary text-accent border border-accent hover:-translate-y-0.5"
                : "bg-primary/50 text-secondary border border-accent/50 cursor-not-allowed"
            }`}
            title={!isCreator && poll ? "Only the poll creator can toggle live results" : undefined}
          >
            {poll?.showLiveResults ? "Hide live results" : "Show live results"}
          </button>
        </div>

        {joinCode && poll?.status === "open" && (
          <div className="mt-3 text-center">
            <p className="text-sm text-secondary mb-2">Share this code:</p>
            <div className="text-3xl font-extrabold text-gradient-primary tracking-widest">
              {joinCode}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-xl border border-red-400 text-sm text-red-200 bg-red-900/30">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentPanel({
  joinCodeInput,
  setJoinCodeInput,
  onJoin,
  isJoining,
  poll,
  totalVotes,
  options,
  votes,
  selected,
  setSelected,
  hasSubmitted,
  resultsVisible,
  onSubmit,
  error,
  currentPollId,
}) {
  const pollOpen = poll?.status === "open";
  return (
    <div className="rounded-2xl border border-accent bg-primary/60 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gradient-primary">Take a poll</h2>
      <p className="text-secondary mt-2">
        Join with the code, pick one option, submit once. Results appear when the poll is closed or live results are enabled.
      </p>

      <div className="mt-4 space-y-3">
        <label className="text-sm font-semibold text-secondary block">Join code</label>
        <input
          value={joinCodeInput}
          onChange={(e) => setJoinCodeInput(e.target.value)}
          placeholder="e.g. 482193"
          className="w-full px-4 py-2 rounded-xl border border-accent bg-primary/80 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={onJoin}
          disabled={isJoining}
          className={`w-full px-4 py-2 rounded-full font-semibold shadow-md transition ${
            isJoining
              ? "bg-primary/50 text-secondary border border-accent/50 cursor-wait"
              : "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:-translate-y-0.5"
          }`}
        >
          {isJoining ? "Joining..." : "Join poll"}
        </button>
      </div>

      {poll && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary">
              Status:{" "}
              <span className="font-semibold text-accent">
                {poll.status === "open" ? "Open" : "Closed"}
              </span>
            </p>
            <p className="text-sm text-secondary">
              {resultsVisible ? `Votes: ${totalVotes}` : "Results hidden"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {options.map((opt, idx) => {
              const isSelected = selected === idx;
              const disabled =
                hasSubmitted || !pollOpen || !currentPollId || !opt;
              return (
                <button
                  key={idx}
                  disabled={disabled}
                  onClick={() => setSelected(idx)}
                  className={`text-left rounded-2xl border border-accent bg-primary p-4 shadow-sm transition-all duration-200 ${
                    isSelected ? "ring-2 ring-offset-2 ring-accent" : ""
                  } ${
                    !disabled
                      ? "hover:-translate-y-0.5 hover:shadow-lg"
                      : "cursor-not-allowed opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg font-semibold text-primary">
                      {opt}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-secondary mt-1 text-sm">
                    {hasSubmitted
                      ? "Vote locked"
                      : pollOpen
                      ? "Tap to choose"
                      : "Poll closed"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={onSubmit}
              disabled={
                hasSubmitted ||
                !pollOpen ||
                selected === null ||
                !currentPollId
              }
              className={`px-5 py-2 rounded-full font-semibold shadow-md transition ${
                hasSubmitted || !pollOpen || selected === null || !currentPollId
                  ? "bg-primary/50 text-secondary border border-accent/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:-translate-y-0.5"
              }`}
            >
              {hasSubmitted ? "Vote submitted" : "Submit vote"}
            </button>
            <p className="text-sm text-secondary">
              {hasSubmitted
                ? "You already voted on this device."
                : "One anonymous vote per device."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-xl border border-red-400 text-sm text-red-200 bg-red-900/30">
          {error}
        </div>
      )}
    </div>
  );
}

function ResultsSection({
  pollQuestion,
  options,
  votes,
  totalVotes,
  resultsVisible,
  status,
}) {
  return (
    <div className="mt-10 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
            Live question
          </p>
          <h3 className="text-2xl font-bold text-gradient-primary mt-1">
            {pollQuestion}
          </h3>
        </div>
        <p className="text-sm text-secondary">
          {resultsVisible
            ? `Votes: ${totalVotes}`
            : "Results hidden until closed or allowed"}
        </p>
      </div>

      {resultsVisible ? (
        options.map((opt, idx) => {
          const count = votes[idx] || 0;
          const percent = totalVotes
            ? Math.round((count / totalVotes) * 100)
            : 0;
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm font-semibold text-secondary mb-2">
                <span>{opt}</span>
                <span className="text-accent">
                  {count} vote{count === 1 ? "" : "s"} • {percent}%
                </span>
              </div>
              <div className="h-3 bg-primary/60 border border-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-4 rounded-2xl border border-dashed border-accent text-sm text-secondary bg-primary/50">
          Results are hidden while the poll is {status || "idle"}. They will appear once the poll closes or live results are enabled.
        </div>
      )}
    </div>
  );
}