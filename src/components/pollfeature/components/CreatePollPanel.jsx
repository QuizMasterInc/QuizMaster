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
 * - Provides a "Leave poll" reset action.
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

return (
<div className="rounded-2xl border border-accent bg-primary/60 p-6 shadow-sm">
    <div className="flex items-center justify-between gap-2">
    <h2 className="text-xl font-semibold text-gradient-primary">Create a poll</h2>
    <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold">
        {poll?.status ? poll.status.toUpperCase() : "IDLE"}
    </span>
    </div>
    <p className="text-secondary mt-2 leading-relaxed">
    Create a poll, share the join code, and manage visibility.
    <br />
    Options: 2–10. {" "}
    {!isSignedIn && (
        <span className="text-accent font-semibold">Sign in required to start a poll.</span>
    )}
    </p>

    <div className="mt-6 space-y-4">
    <label className="text-sm font-bold text-secondary block">Enter Poll Question Below</label>
    <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. What is your favorite color?"
        className="w-full px-4 py-3 rounded-xl border border-input bg-input text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent"
    />

    <div className="space-y-2">
        {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2">
            <input
            value={opt}
            onChange={(e) => handleOptionChange(e.target.value, idx)}
            className="flex-1 px-4 py-2 rounded-xl border border-input bg-input text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder={`Option ${idx + 1}`}
            />
            {options.length > 2 && (
            <button
                onClick={() => removeOption(idx)}
                className="text-xs px-3 py-2 rounded-full border border-primary text-secondary hover:text-accent transition"
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
        disabled={options.length >= 10}
        className={`px-3 py-2 rounded-full text-sm font-semibold border border-accent transition ${
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
        className={`px-4 py-2 rounded-full font-semibold shadow-md transition-transform duration-200 ${
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
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition ${
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
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition ${
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
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition ${
                poll
                ? "bg-secondary text-accent border border-primary hover:-translate-y-0.5"
                : "bg-secondary text-secondary border border-primary cursor-not-allowed"
            }`}
            >
            {poll?.showLiveResults ? "Hide live results" : "Show live results"}
            </button>
        </>
        )}

        {poll && (
        <button
            onClick={onReset}
            className="px-4 py-2 rounded-full font-semibold border border-primary text-secondary hover:text-accent transition"
        >
            Leave poll
        </button>
        )}
    </div>

    {isCreator && joinCode && poll?.status === "open" && (
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