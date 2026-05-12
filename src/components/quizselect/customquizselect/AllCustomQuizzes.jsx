import QuizList from "./QuizList";

const AllCustomQuizzes = () => {
  return (
    <QuizList
      title="User-Made Quizzes"
      dataSource="browseCustomQuizzes"
      filters={["search", "creator", "privacy", "sort"]}
      showRefreshButton={true}
      linkCreatorToProfile={true}
      className="all-custom-quizzes-page"
    />
  );
};

export default AllCustomQuizzes;