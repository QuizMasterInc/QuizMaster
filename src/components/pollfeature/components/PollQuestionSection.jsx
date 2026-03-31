export default function PollQuestionSection({
  pollQuestion,
  currentPollId,
  totalVotes,
  status,
}) {
  const hasQuestion = Boolean(pollQuestion?.trim());

  return (
    <section className="rounded-[2rem] border border-accent/40 bg-gradient-to-br from-primary via-primary to-secondary/60 px-6 py-12 text-center shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
        Live Poll
      </p>
      <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gradient-primary sm:text-5xl lg:text-6xl">
        {hasQuestion ? pollQuestion : "Create a poll or join one to start voting."}
      </h1>
      <p className="mx-auto mt-4 max-w-3xl text-base text-secondary sm:text-lg">
        The question stays front and center, the voting tools stay focused in the middle, and results remain clearly separated below.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <div className="rounded-full border border-primary bg-secondary px-4 py-2 text-secondary">
          {currentPollId ? `Total votes: ${totalVotes}` : "No active poll"}
        </div>
        <div className="rounded-full border border-primary bg-secondary px-4 py-2 text-secondary">
          Status: {status || "Idle"}
        </div>
      </div>
    </section>
  );
}
