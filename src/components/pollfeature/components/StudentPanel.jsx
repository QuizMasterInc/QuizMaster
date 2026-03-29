/**
 * ============================================================
 * StudentPanel.jsx
 * ============================================================
 *
 * Presentational component for participants (non-creators).
 *
 * Responsibilities:
 * - Allows a user to join a poll using a join code.
 * - Renders the poll status and (optionally) live results info.
 * - Displays selectable poll options and submits a single vote.
 * - Provides a "Leave poll" action to reset local UI state.
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
const toggleOption = (index) => {
setSelected((prev) =>
prev.includes(index)
? prev.filter((i) => i !== index)
: [...prev, index]
);
};
return (
<div className="rounded-2xl border border-accent bg-primary/60 p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-gradient-primary">Take a poll</h2>
    <p className="text-secondary mt-2">
    Join with the code, sign in, pick one or more options, submit once per account. Results appear when the poll is closed or live results are enabled.
    </p>

    <div className="mt-4 space-y-3">
    <label className="text-sm font-semibold text-secondary block">Join code</label>
    <input
        value={joinCodeInput}
        onChange={(e) => setJoinCodeInput(e.target.value)}
        placeholder="e.g. 482193"
        className="w-full px-4 py-2 rounded-xl border border-input bg-input text-primary focus:outline-none focus:ring-2 focus:ring-accent"
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
            const isSelected = selected.includes(idx);
            const disabled =
            hasSubmitted || !pollOpen || !currentPollId || !opt;
            return (
            <button
                key={idx}
                disabled={disabled}
                onClick={() => toggleOption(idx)}
                className={`text-left rounded-2xl border border-primary bg-secondary p-4 shadow-sm transition-all duration-200 ${
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
                <div className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOption(idx)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={disabled}
                    className="h-4 w-4 accent-blue-500"
                    />
                    {isSelected && (
                    <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                        Selected
                    </span>
                    )}
                </div>
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
            selected.length === 0 ||
            !currentPollId ||
            isFetchingVote
            }
            className={`px-5 py-2 rounded-full font-semibold shadow-md transition ${
            hasSubmitted || !pollOpen || selected.length === 0 || !currentPollId || isFetchingVote
                ? "bg-secondary text-secondary border border-primary cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:-translate-y-0.5"
            }`}
        >
            {hasSubmitted ? "Vote submitted" : isFetchingVote ? "Checking..." : "Submit vote"}
        </button>
        <p className="text-sm text-secondary">
            {hasSubmitted
            ? "You already voted with this account."
            : "Sign in to vote once per account."}
        </p>
        {poll && (
            <button
            onClick={onReset}
            className="text-sm px-3 py-2 rounded-full border border-primary text-secondary hover:text-accent transition"
            >
            Leave poll
            </button>
        )}
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
