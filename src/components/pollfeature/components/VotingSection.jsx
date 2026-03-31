export default function VotingSection({ children }) {
  return (
    <section className="rounded-[2rem] border border-primary bg-card/80 p-6 shadow-lg sm:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Voting
        </p>
        <h2 className="mt-3 text-2xl font-bold text-primary sm:text-3xl">
          Create, join, and cast votes from one focused action area.
        </h2>
        <p className="mt-3 text-secondary">
          Creator controls and participant voting stay grouped here so this section can later move cleanly into dedicated poll routes without changing service behavior.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {children}
      </div>
    </section>
  );
}
