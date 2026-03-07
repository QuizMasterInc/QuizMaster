import QuizList from "./QuizList";

const AllCustomQuizzes = () => {
  return (
    <QuizList
      title="User-Made Quizzes"
      dataSource="browseCustomQuizzes"
      filters={["search", "privacy", "sort"]}
      showRefreshButton={true}
      linkCreatorToProfile={true}
    />
  );
};

export default AllCustomQuizzes;