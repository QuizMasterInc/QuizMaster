/**
 * ============================================================
 * CreatePollPanel.jsx
 * ============================================================
 *
 * Presentational component for poll creators.
 *
 * Responsibilities:
 * - Renders the poll creation form (question + 2–10 options).
 * - Allows dynamic adding/removing of options.
 * - Starts a poll (via onStart handler).
 * - Displays and manages creator-only controls:
 *     • Close poll
 *     • Reopen poll
 *     • Toggle live results visibility
 * - Displays the join code (creator-only, when poll is open).
 * - Provides an "End poll" action that permanently closes/removes the active poll.
 *
 * This component is UI-focused only:
 * - No Firestore calls occur here directly.
 * - No authentication logic is enforced here.
 * - All actions are delegated to handlers passed down from Poll.jsx.
 *
 * Business rules and security are enforced in Poll.jsx
 * and the pollService layer.
 * ============================================================
 */

import { FaTimes } from "react-icons/fa";

export default function CreatePollPanel({
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
onReset,
}) {
const handleOptionChange = (value, idx) => {
const next = [...options];
next[idx] = value;
setOptions(next);
};

const addOption = () => {
if (options.length >= 10) return;
setOptions([...options, ""]);
};

const removeOption = (idx) => {
if (options.length <= 2) return;
setOptions(options.filter((_, i) => i !== idx));
};

const visibleOptions = poll?.options || options;
const visibleVotes = poll?.votes || visibleOptions.map(() => 0);
const totalVotes = visibleVotes.reduce((sum, voteCount) => sum + voteCount, 0);
const visibleQuestion = poll?.question || question;
const maxOptionLength = Math.max(
0,
...visibleOptions.map((opt) => String(opt || "").length)
);
const stackOptionCards = maxOptionLength > 70;
const questionRows = visibleQuestion.length > 120 ? 4 : visibleQuestion.length > 70 ? 3 : 1;
const optionRows = maxOptionLength > 110 ? 4 : maxOptionLength > 55 ? 3 : 2;
const activeOptionMinHeight = poll
? Math.min(220, Math.max(112, 88 + Math.ceil(maxOptionLength / 45) * 18))
: undefined;

return (
<div className="min-w-0 rounded-2xl border border-accent bg-primary/60 p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
    <h2 className="min-w-0 text-xl font-semibold text-gradient-primary">Create a poll</h2>
    <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
        {poll?.status ? poll.status.toUpperCase() : "IDLE"}
    </span>
    </div>
    {/* <p className="text-secondary mt-2 leading-relaxed">
    Create a poll, share the join code, and manage visibility.
    <br />
    Options: 2–10. {" "}

    </p> */}
    {!isSignedIn && (
        <span className="text-accent font-semibold">Sign in required to start a poll.</span>
    )}

    <div className="mt-6 min-w-0 space-y-3">
    <label className="text-sm font-bold text-secondary block">Enter Poll Question Below</label>
    <textarea
        value={visibleQuestion}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={!!poll}
        rows={questionRows}
        placeholder="e.g. What is your favorite color?"
        className="w-full resize-none rounded-xl border border-accent bg-input px-4 py-2 text-xl font-semibold leading-snug text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-90"
    />

    <div className={`grid min-w-0 grid-cols-1 gap-3 ${stackOptionCards ? "" : "md:grid-cols-2"}`}>
        {visibleOptions.map((opt, idx) => {
        const voteCount = visibleVotes[idx] || 0;
        const votePercent = totalVotes
            ? Math.round((voteCount / totalVotes) * 100)
            : 0;

        return (
        <div
            key={idx}
            style={activeOptionMinHeight ? { minHeight: `${activeOptionMinHeight}px` } : undefined}
            className={`min-w-0 ${
            poll
                ? "flex flex-col rounded-xl border border-input bg-input p-3"
                : ""
            }`}
        >
        <div className="flex min-w-0 items-center gap-2">
            <textarea
            value={opt}
            onChange={(e) => handleOptionChange(e.target.value, idx)}
            disabled={!!poll}
            rows={optionRows}
            className={`min-w-0 flex-1 text-primary focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed ${
                poll
                ? "resize-none rounded-none border-0 bg-transparent p-0 text-base font-semibold leading-snug disabled:opacity-100"
                : "resize-none rounded-xl border border-input bg-input px-4 py-2"
            }`}
            placeholder={`Option ${idx + 1}`}
            />
            {!poll && options.length > 2 && (
            <button
                onClick={() => removeOption(idx)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary bg-[var(--card-bg)] text-secondary transition-all duration-200 hover:border-red-400 hover:text-red-400 hover:scale-105"
                aria-label={`Remove option ${idx + 1}`}
            >
                <FaTimes className="h-3.5 w-3.5" />
            </button>
            )}
        </div>
        {isCreator && poll && (
            <div className="mt-auto pt-3">
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
        </div>
        );
        })}
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
        onClick={addOption}
        disabled={options.length >= 10}
        className={`w-full rounded-full border border-accent px-3 py-2 text-sm font-semibold transition sm:w-auto ${
            options.length >= 10
            ? "text-secondary border-accent/50 cursor-not-allowed"
            : "text-accent hover:-translate-y-0.5"
        }`}
        >
        Add option
        </button>

        <button
        onClick={onStart}
        disabled={isCreating || !isSignedIn}
        className={`w-full rounded-full px-4 py-2 font-semibold shadow-md transition-transform duration-200 sm:w-auto ${
            isCreating || !isSignedIn
            ? "bg-secondary text-secondary border border-primary cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:-translate-y-0.5"
        }`}
        title={!isSignedIn ? "Sign in to start a poll" : undefined}
        >
        {isCreating ? "Starting..." : "Start poll"}
        </button>

        {isCreator && (
        <>
            <button
            onClick={onClose}
            disabled={!poll || poll.status === "closed"}
            className={`w-full rounded-full px-4 py-2 font-semibold shadow-md transition sm:w-auto ${
                poll && poll.status !== "closed"
                ? "bg-secondary text-accent border border-primary hover:-translate-y-0.5"
                : "bg-secondary text-secondary border border-primary cursor-not-allowed"
            }`}
            >
            Close poll
            </button>

            <button
            onClick={onOpen}
            disabled={!poll || poll.status === "open"}
            className={`w-full rounded-full px-4 py-2 font-semibold shadow-md transition sm:w-auto ${
                poll && poll.status === "closed"
                ? "bg-secondary text-accent border border-primary hover:-translate-y-0.5"
                : "bg-secondary text-secondary border border-primary cursor-not-allowed"
            }`}
            >
            Reopen
            </button>

            <button
            onClick={onToggleLive}
            disabled={!poll}
            className={`w-full rounded-full px-4 py-2 font-semibold shadow-md transition sm:w-auto ${
                poll
                ? "bg-secondary text-accent border border-primary hover:-translate-y-0.5"
                : "bg-secondary text-secondary border border-primary cursor-not-allowed"
            }`}
            >
            {poll?.showLiveResults ? "Hide results from voters" : "Show results to voters"}
            </button>
        </>
        )}

        {poll && (
        <button
            onClick={onReset}
            className="w-full rounded-full border border-red-400/70 px-4 py-2 font-semibold text-red-200 transition hover:bg-red-900/30 sm:w-auto"
            title="End this poll permanently and remove the join code"
        >
            End poll
        </button>
        )}
    </div>

    {isCreator && joinCode && poll?.status === "open" && (
        <div className="mt-3 text-center">
        <p className="text-sm text-secondary mb-2">Share this code:</p>
        <div className="break-all text-2xl font-extrabold tracking-widest text-gradient-primary sm:text-3xl">
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
