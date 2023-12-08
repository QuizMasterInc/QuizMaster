# CustomQuiz

## Purpose
This section is dedicated to the creation and editing of custom quizzes.

CustomQuiz uses a function to grab the custom quizzes the user has created as well as uses functions to create and send custom quizzes to the database. It uses QuizCreation to create the quiz data and QuizQuestionsList to edit the questions.

EditCustomQuiz and EditQuestion will allow a user to edit previously created quizzes by calling the CustomQuizContext from the contexts folder, which fetches custom quizzes.

QuizCreation handles the functionality of quiz data like tags and passwords.

QuizQuestionsList handles the functionality of quiz question data.