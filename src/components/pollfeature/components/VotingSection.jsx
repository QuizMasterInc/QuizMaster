/**
 * ============================================================
 * VotingSection.jsx
 * ============================================================
 *
 * Shared layout wrapper for the live polling experience.
 *
 * Responsibilities:
 * - Provides a consistent responsive container for poll content
 * - Handles spacing/layout between creator and participant panels
 * - Keeps the polling interface visually centered and mobile-friendly
 * - Displays shared polling instructions and page structure
 *
 * Notes:
 * - Uses a mobile-first responsive layout
 * - Child components are injected through props.children
 * - Does not contain business logic or Firebase interactions
 * ============================================================
 */
export default function VotingSection({ children }) {
  return (
    <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-primary bg-card/80 p-4 shadow-lg sm:rounded-[2rem] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent sm:tracking-[0.3em]">
          Voting
        </p>
        <h2 className="mt-3 text-xl font-bold text-primary sm:text-2xl">
          Live polling made simple and interactive.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">
          Create live polls, share join codes with participants, and view responses update in real time. Participants can join instantly using the poll code provided by the creator.
        </p>
      </div>

      <div className="mt-6 w-full sm:mt-8">
        {children}
      </div>
    </section>
  );
}
