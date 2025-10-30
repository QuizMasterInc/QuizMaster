import QuizList from "./QuizList";

const AllTeacherQuizzes = () => {
  return (
    <QuizList
      title="Teacher-Made Quizzes"
      dataSource="teacherQuizzes"
      filters={["search", "sort"]}
      showRefreshButton={false}
    />
  );
};

export default AllTeacherQuizzes;