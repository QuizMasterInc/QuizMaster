import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  closePoll,
  createPoll,
  endPoll,
  findPollByCode,
  getUserVote,
  openPoll,
  setShowLiveResults,
  submitVote,
  subscribeToPoll,
} from "../../services/polls/pollService";
import CreatePollPanel from "./components/CreatePollPanel.jsx";
import PollQuestionSection from "./components/PollQuestionSection.jsx";
import StudentPanel from "./components/StudentPanel.jsx";
// import ResultsSection from "./components/ResultSection.jsx";
import VotingSection from "./components/VotingSection.jsx";
import PollLanding from "./components/PollLanding.jsx";

/**
 * ============================================================
 * POLL FEATURE – MAIN CONTAINER (Poll.jsx)
 * ============================================================
 *
 * This file acts as the orchestration layer for the Poll feature.
 * It is NOT just  UI component — it is the state controller and
 * coordination hub between:
 *
 *   - Firebase Authentication (via useAuth)
 *   - Firestore poll service layer (pollService)
 *   - UI components:
 *       • CreatePollPanel (creator controls)
 *       • StudentPanel (participant interaction)
 *       • ResultsSection (aggregated results view)
 *
 * Responsibilities of this file:
 * ------------------------------------------------------------
 * 1) Role Resolution
 *    - Determines whether the current user is the poll creator.
 *    - Controls creator-only actions (close/open poll, toggle live results).
 *
 * 2) Poll Lifecycle Management
 *    - Create poll (with createdBy enforcement).
 *    - Join poll by code.
 *    - Attach/detach realtime Firestore listener.
 *    - Reset and cleanup subscription safely.
 *
 * 3) Vote Handling
 *    - Enforces authenticated voting (one vote per uid).
 *    - Prevents UI-based duplicate submissions.
 *    - Delegates actual vote enforcement to Firestore rules + service layer.
 *
 * 4) Realtime Updates
 *    - Subscribes to poll updates.
 *    - Handles deleted/unavailable polls gracefully.
 *
 * 5) UI State Orchestration
 *    - Manages loading, error, and informational messages.
 *    - Computes derived state (totalVotes, results visibility, etc.).
 * ============================================================
 */


// Use placeholders (ghost text) instead of prefilled demo content.
const defaultQuestion = "";
const defaultOptions = ["", "", "", ""];

export default function Poll() {
  const { currentUser } = useAuth();

  const [pollMode, setPollMode] = useState(null);
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
  const [studentSelection, setStudentSelection] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isFetchingVote, setIsFetchingVote] = useState(false);

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

  // REFACTOR (optional): move the subscription logic below into a custom hook
  // e.g. usePollSubscription(pollId, setPollData, setStudentError)
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
        setStudentError("This poll has ended or is no longer available.");
        setInfoMessage("This poll has ended or is no longer available.");
        setPollData(null);
        setCurrentPollId(null);
        setHasSubmitted(false);
        setStudentSelection([]);
        return;
      }
      setPollData(payload.data);
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
      if (cleanedOptions.length < 2 || cleanedOptions.length > 10) {
        setTeacherError("Enter between 2 and 10 options.");
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
      setStudentSelection([]);
      setStudentJoinCode(code);
      // setInfoMessage("Poll started. Share the join code with participants.");
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
      // Do not set joinCode here; joinCode is a creator-only value.
      setHasSubmitted(false);
      setStudentSelection([]);
      if (currentUser?.uid) {
        setIsFetchingVote(true);
        getUserVote(found.id, currentUser.uid)
          .then((vote) => {
            setHasSubmitted(!!vote);
            setStudentSelection(vote?.optionIndexes || []);
          })
          .catch((err) => setStudentError(err.message || "Unable to verify vote."))
          .finally(() => setIsFetchingVote(false));
      }
      attachListener(found.id);
    } catch (error) {
      setStudentError(error.message || "Unable to join poll.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!currentPollId || studentSelection.length === 0) return;
    if (!currentUser?.uid) {
      setStudentError("Please sign in to vote.");
      return;
    }
    try {
      await submitVote(currentPollId, studentSelection, currentUser.uid);
      setHasSubmitted(true);
      setInfoMessage("Vote submitted.");
    } catch (error) {
      setStudentError(error.message || "Failed to submit vote.");
    }
  };

  const handleClosePoll = async () => {
    if (!currentPollId) return;
    try {
      await closePoll(currentPollId, currentUser?.uid);
    } catch (error) {
      setTeacherError(error.message || "Failed to close poll.");
    }
  };

  const handleOpenPoll = async () => {
    if (!currentPollId) return;
    try {
      await openPoll(currentPollId, currentUser?.uid);
    } catch (error) {
      setTeacherError(error.message || "Failed to reopen poll.");
    }
  };

  const handleToggleLiveResults = async () => {
    if (!currentPollId) return;
    try {
      await setShowLiveResults(
        currentPollId,
        !(pollData?.showLiveResults ?? false),
        currentUser?.uid
      );
    } catch (error) {
      setTeacherError(error.message || "Could not update visibility.");
    }
  };

  const resetPollState = () => {
    setPollData(null);
    setCurrentPollId(null);
    setJoinCode("");
    setStudentJoinCode("");
    setStudentSelection([]);
    setHasSubmitted(false);
    setStudentError("");
    setTeacherError("");
    setInfoMessage("");
    setTeacherQuestion(defaultQuestion);
    setTeacherOptions(defaultOptions);
    setPollMode(null);
    resetSubscription();
  };

  const handleReset = () => {
    resetPollState();
  };

  const handleEndPollAndReset = async () => {
    const shouldEndActivePoll = currentPollId && isCreator;

    if (!shouldEndActivePoll) {
      resetPollState();
      return;
    }

    try {
      await endPoll(currentPollId, currentUser?.uid);
    } catch (error) {
      setTeacherError(error.message || "Failed to end poll.");
      return;
    }

    resetPollState();
  };

  const pollQuestion = pollData?.question || teacherQuestion;
  const pollOptions = pollData?.options || teacherOptions;
  const votes = pollData?.votes || pollOptions.map(() => 0);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-primary px-3 py-8 text-primary sm:px-6 sm:py-16">
      <div className="w-full max-w-6xl mx-auto">
        {/* <PollQuestionSection
          pollQuestion={pollQuestion}
          currentPollId={currentPollId}
          totalVotes={totalVotes}
          status={pollData?.status}
        /> */}

        {/* {infoMessage && (
          <div className="mt-6 p-3 rounded-xl border border-primary text-sm text-primary bg-secondary">
            {infoMessage}
          </div>
        )} */}

        {!pollMode && <PollLanding onChooseMode={setPollMode} />}

        {pollMode && (
          <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start gap-6 pt-4 sm:min-h-[calc(100vh-8rem)] sm:gap-8 sm:pt-6">
            <div className="w-full max-w-4xl">
              <button
                type="button"
                onClick={handleEndPollAndReset}
                className="rounded-xl border border-primary bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-secondary shadow-[0_0_18px_rgba(168,85,247,0.18),0_8px_30px_rgba(59,130,246,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-[0_0_26px_rgba(168,85,247,0.28),0_12px_38px_rgba(59,130,246,0.16)]"
              >
                ← Back
              </button>
            </div>

            <div
              className="grid w-full max-w-4xl gap-6"
            >
              <VotingSection>
                {pollMode === "create" && (
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
                    onReset={handleEndPollAndReset}
                  />
                )}

                {pollMode === "take" && (
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
                    isFetchingVote={isFetchingVote}
                    onReset={handleReset}
                  />
                )}
              </VotingSection>

              {/* {pollData && (
                <ResultsSection
                  pollQuestion={pollQuestion}
                  options={pollOptions}
                  votes={votes}
                  totalVotes={totalVotes}
                  resultsVisible={resultsVisible}
                  status={pollData?.status}
                />
              )} */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
