/**
 * ============================================================
 * StudentPanel.jsx
 * ============================================================
 *
 * Presentational component for participants (non-creators).
 *
 * Responsibilities:
 * - Allows anonymous participants to join a poll using a join code.
 * - Renders the poll status and (optionally) live results info.
 * - Displays selectable poll options and submits a single vote.
 * - Provides a "Leave poll" action that resets only the participant's local UI state.
 *
 * This component is UI-only:
 * - No Firestore reads/writes happen here directly.
 * - No permissions are enforced here.
 * - All data + actions are passed down from Poll.jsx.
 * ============================================================
 */

export default function StudentPanel({
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
isFetchingVote,
onReset,
}) {
const pollOpen = poll?.status === "open";
const pollClosed = poll?.status === "closed";
const toggleOption = (index) => {
setSelected((prev) =>
prev.includes(index)
? prev.filter((i) => i !== index)
: [...prev, index]
);
};
const maxOptionLength = Math.max(
0,
...options.map((opt) => String(opt || "").length)
);
const stackOptionCards = maxOptionLength > 70;
const optionCardMinHeight = Math.min(
220,
Math.max(112, 88 + Math.ceil(maxOptionLength / 45) * 18)
);
return (
<div className="mx-auto w-full min-w-0 rounded-2xl border border-accent bg-primary/60 p-4 shadow-sm sm:p-5">
    <h2 className="text-center text-xl font-semibold text-gradient-primary">Take a poll</h2>
    <div className="mt-4 h-px w-full bg-accent/70" />

    {!poll ? (
    <div className="mt-4 space-y-3">
        <label className="text-sm font-semibold text-secondary block">Join code</label>
        <input
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            placeholder="e.g. 482193"
            inputMode="numeric"
            className="w-full px-4 py-3 rounded-xl border border-input bg-input text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
            onClick={onJoin}
            disabled={isJoining}
            className={`w-full px-4 py-2 rounded-full font-semibold shadow-md transition ${
            isJoining
                ? "bg-secondary text-secondary border border-primary cursor-wait"
                : "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:-translate-y-0.5"
            }`}
        >
            {isJoining ? "Joining..." : "Join poll"}
        </button>
        
    </div>
) : (
    <div className="mt-5 min-w-0">
        <p className="text-base font-bold text-primary">Question</p>
        <p className="mt-1 rounded-xl border border-accent bg-input px-4 py-3 break-words text-2xl font-bold leading-snug text-primary sm:text-2xl">
        {poll.question || "Untitled poll"}
        </p>
    </div>
    )}

    {poll && (
    <div className="mt-6">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-secondary">
            Status:{" "}
            <span className="font-semibold text-accent">
            {pollOpen ? "Open" : "Closed"}
            </span>
        </p>
        <p className="text-sm text-secondary">
            {resultsVisible ? `Votes: ${totalVotes}` : "Results hidden"}
        </p>
        </div>

        {pollClosed && (
        <div className="mt-4 rounded-xl border border-yellow-400/60 bg-yellow-900/20 p-3 text-sm text-yellow-100">
            This poll is currently closed by the creator. You can view it, but voting is disabled unless the creator reopens it.
        </div>
        )}

        <div className={`mt-4 grid min-w-0 grid-cols-1 gap-3 ${stackOptionCards ? "" : "md:grid-cols-2"}`}>
        {options.map((opt, idx) => {
            const isSelected = selected.includes(idx);
            const voteCount = votes[idx] || 0;
            const votePercent = totalVotes
            ? Math.round((voteCount / totalVotes) * 100)
            : 0;
            const disabled =
            hasSubmitted || !pollOpen || !currentPollId || !opt;
            return (
            <button
                key={idx}
                disabled={disabled}
                onClick={() => toggleOption(idx)}
                style={{ minHeight: `${optionCardMinHeight}px` }}
                className={`w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-primary bg-secondary p-4 text-left shadow-sm transition-all duration-200 ${
                isSelected ? "ring-2 ring-offset-2 ring-accent" : ""
                } ${
                !disabled
                    ? "hover:-translate-y-0.5 hover:shadow-lg"
                    : "cursor-not-allowed opacity-80"
                }`}
            >
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <span className="min-w-0 overflow-hidden break-words text-base font-semibold leading-snug text-primary sm:text-lg">
                    {opt}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                    <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOption(idx)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={disabled}
                    className="h-4 w-4 accent-blue-500"
                    />
                    {isSelected && (
                    <span className="hidden rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent sm:inline">
                        Selected
                    </span>
                    )}
                </div>
                </div>
                <p className="mt-2 break-words text-sm text-secondary">
                {hasSubmitted
                    ? "Vote locked"
                    : pollOpen
                    ? "Tap to choose"
                    : "Poll closed"}
                </p>
                {resultsVisible && (
                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold">
                    <span className="text-secondary">
                        {voteCount} vote{voteCount === 1 ? "" : "s"}
                    </span>
                    <span className="shrink-0 text-accent">{votePercent}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full border border-primary bg-primary/50">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${votePercent}%` }}
                    />
                    </div>
                </div>
                )}
            </button>
            );
        })}
        </div>

        <div className="mt-5 flex flex-col items-stretch gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
                onClick={onSubmit}
                disabled={
                hasSubmitted ||
                !pollOpen ||
                selected.length === 0 ||
                !currentPollId ||
                isFetchingVote
                }
                className={`w-full rounded-full px-4 py-2 font-semibold shadow-md transition-transform duration-200 sm:w-auto ${
                hasSubmitted || !pollOpen || selected.length === 0 || !currentPollId || isFetchingVote
                    ? "bg-secondary text-secondary border border-primary cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:-translate-y-0.5 hover:shadow-lg"
                }`}
            >
                {hasSubmitted ? "Vote submitted" : isFetchingVote ? "Checking..." : "Submit vote"}
            </button>
            {poll && (
                <button
                onClick={onReset}
                className="w-full rounded-full border border-primary px-4 py-2 text-sm text-secondary transition hover:text-accent sm:w-auto"
                >
                Leave poll
                </button>
            )}
        </div>
        <p className="min-w-0 break-words text-center text-sm text-secondary">
            {hasSubmitted
            ? "Your vote has already been submitted."
            : pollOpen
            ? "Anonymous participants can vote once per poll session."
            : "Voting is disabled because this poll is closed."}
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
