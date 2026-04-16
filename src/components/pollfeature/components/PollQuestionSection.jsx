export default function PollQuestionSection({
  pollQuestion,
  currentPollId,
  totalVotes,
  status,
}) {
  const hasQuestion = Boolean(pollQuestion?.trim());

  return (
    <section className="rounded-[2rem] border border-accent/40 bg-gradient-to-br from-primary via-primary to-secondary/60 px-6 py-12 text-center shadow-xl">
      <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gradient-primary sm:text-6xl lg:text-3xl">
        Poll Question
      </h1>
      <p className="mx-auto mt-4 max-w-3xl text-base text-secondary sm:text-lg">
        {hasQuestion ? pollQuestion : "Once a poll has been started, the question will appear here."}
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
