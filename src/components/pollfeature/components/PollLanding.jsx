/*
PollLanding.jsx
Purpose:
This component acts as the main entry screen for the polling feature.
It gives users a clean choice between creating a poll or taking/joining a poll.
*/
import React from "react";
import { FaChartBar, FaPlus, FaVoteYea } from "react-icons/fa";

function PollLanding({ onChooseMode }) {
return (
<section className="relative w-full max-w-5xl mx-auto -mt-8 overflow-visible px-4 pt-2 pb-10 sm:-mt-10 sm:px-6 sm:pt-3 sm:pb-14 lg:-mt-12 lg:pt-4">
    <div className="absolute inset-0 pointer-events-none overflow-visible">
    <div className="absolute left-1/2 top-4 h-[24rem] w-[58rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_52%,rgba(168,85,247,0.20),transparent_36%),radial-gradient(circle_at_68%_44%,rgba(59,130,246,0.16),transparent_38%)] blur-3xl" />
    </div>

    <div className="relative z-10 text-center mb-8 sm:mb-10">
    <p className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--card-bg)]/70 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.26em] text-[var(--accent)] shadow-[0_0_22px_rgba(168,85,247,0.18)] backdrop-blur-md mb-5">
        <FaChartBar className="h-3 w-3" />
        Live Polling
    </p>

    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight drop-shadow-[0_0_18px_rgba(168,85,247,0.08)]">
        What would you like to do?
    </h1>

    <p className="text-[var(--text-secondary)] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
        Create a poll for others to answer, or join an existing poll and cast your vote.
    </p>
    </div>

    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
    <button
        type="button"
        onClick={() => onChooseMode("create")}
        className="group relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-[var(--accent)] bg-[var(--card-bg)] p-6 text-left shadow-[0_0_28px_rgba(168,85,247,0.18),0_0_70px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_34px_rgba(168,85,247,0.28),0_0_80px_rgba(59,130,246,0.14)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] sm:p-7"
    >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_0%_100%,rgba(168,85,247,0.16),transparent_45%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.12),transparent_45%)]" />
        <div className="absolute -inset-10 pointer-events-none opacity-70 blur-3xl bg-[radial-gradient(circle_at_0%_100%,rgba(168,85,247,0.20),transparent_42%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.14),transparent_45%)]" />

        <div className="relative z-10 flex min-h-[14rem] flex-col justify-between">
        <div>
            <div className="mb-5 flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_22px_rgba(168,85,247,0.20)] transition-transform duration-300 group-hover:scale-105">
                <FaPlus className="h-5 w-5" />
            </span>

            <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
                Create a Poll
            </h2>
            </div>

            <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-md">
            Build a poll question, add answer choices, and view the results as people vote.
            </p>
        </div>

        <span className="mt-7 inline-flex items-center text-[var(--accent)] text-base font-bold group-hover:translate-x-1 transition-transform duration-300">
            Start creating →
        </span>
        </div>
    </button>

    <button
        type="button"
        onClick={() => onChooseMode("take")}
        className="group relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-[var(--accent)] bg-[var(--card-bg)] p-6 text-left shadow-[0_0_28px_rgba(59,130,246,0.16),0_0_70px_rgba(168,85,247,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_34px_rgba(59,130,246,0.26),0_0_80px_rgba(168,85,247,0.14)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] sm:p-7"
    >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_0%_100%,rgba(168,85,247,0.12),transparent_45%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.17),transparent_45%)]" />
        <div className="absolute -inset-10 pointer-events-none opacity-70 blur-3xl bg-[radial-gradient(circle_at_0%_100%,rgba(168,85,247,0.14),transparent_42%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.20),transparent_45%)]" />

        <div className="relative z-10 flex min-h-[14rem] flex-col justify-between">
        <div>
            <div className="mb-5 flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_22px_rgba(168,85,247,0.20)] transition-transform duration-300 group-hover:scale-105">
                <FaVoteYea className="h-5 w-5" />
            </span>

            <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
                Take a Poll
            </h2>
            </div>

            <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-md">
            Join a poll, answer the question, and check the shared results after voting.
            </p>
        </div>

        <span className="mt-7 inline-flex items-center text-[var(--accent)] text-base font-bold group-hover:translate-x-1 transition-transform duration-300">
            Start voting →
        </span>
        </div>
    </button>
    </div>
</section>
);
}

export default PollLanding;
