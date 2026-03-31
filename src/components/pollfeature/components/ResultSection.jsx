/**
 * ============================================================
 * ResultsSection.jsx
 * ============================================================
 *
 * Presentational component responsible for rendering poll results.
 *
 * Responsibilities:
 * - Displays the active poll question.
 * - Shows total vote count when results are visible.
 * - Renders each option with vote count and percentage bar.
 * - Shows a "results hidden" state when live results are disabled
 *   and the poll is still open.
 *
 * This component is purely visual:
 * - It does NOT fetch data.
 * - It does NOT manage subscriptions.
 * - It does NOT enforce permissions.
 *
 * All business logic and security decisions are handled by Poll.jsx
 * and the pollService layer.
 * ============================================================
 */
export default function ResultsSection({
pollQuestion,
options,
votes,
totalVotes,
resultsVisible,
status,
}) {
return (
<section className="rounded-[2rem] border border-accent/30 bg-secondary/70 p-6 shadow-inner sm:p-8">
    <div className="flex items-start justify-between gap-4 border-b border-primary pb-5">
    <div>
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">
        Results
        </p>
        <h3 className="text-2xl font-bold text-primary mt-2">
        Current standings
        </h3>
        <p className="text-sm text-secondary mt-2">
        {pollQuestion || "Results will appear here once a poll question is available."}
        </p>
    </div>
    <p className="text-sm text-secondary">
        {resultsVisible
        ? `Votes: ${totalVotes}`
        : "Results hidden until closed or allowed"}
    </p>
    </div>

    <div className="mt-6 space-y-5">
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
            <div className="h-3 bg-secondary border border-primary rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${percent}%` }}
            />
            </div>
        </div>
        );
    })
    ) : (
    <div className="p-4 rounded-2xl border border-dashed border-accent text-sm text-secondary bg-secondary">
        Results are hidden while the poll is {status || "idle"}. They will appear once the poll closes or live results are enabled.
    </div>
    )}
    </div>
</section>
);
}
