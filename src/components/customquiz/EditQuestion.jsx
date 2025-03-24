import { useState, useEffect } from 'react';
import { useCustomQuizContext } from '../../contexts/CustomQuizContext';

function EditQuestion({ num, q }) {
  const type = q.type || q.questionType || "Multiple";

  const [editingQuestion, toggleEditing] = useState(false);
  const [question, editQuestion] = useState(q.question);
  const [questionNum, changeQuestionNum] = useState(num.split(" ")[1]);
  const [answer_A, editAnswer_A] = useState(q.option_1);
  const [answer_B, editAnswer_B] = useState(q.option_2);
  const [answer_C, editAnswer_C] = useState(q.option_3);
  const [answer_D, editAnswer_D] = useState(q.option_4);
  const [correctAnswer, changeCorrectAnswer] = useState(q.correct_answer);

  const customQuizData = useCustomQuizContext();

  const handleFinishClick = () => {
    toggleEditing(false);

    const sameQuestion = customQuizData.quiz.questions[num].question === question;
    const sameOrder = num.split(" ")[1] === questionNum;
    const sameAnswers = (
      customQuizData.quiz.questions[num].option_1 === answer_A &&
      customQuizData.quiz.questions[num].option_2 === answer_B &&
      customQuizData.quiz.questions[num].option_3 === answer_C &&
      customQuizData.quiz.questions[num].option_4 === answer_D &&
      customQuizData.quiz.questions[num].correct_answer === correctAnswer
    );
    const sameFillInBlank = customQuizData.quiz.questions[num].option_1 === answer_A;

    if (sameQuestion && sameOrder && (type === "FillInTheBlank" ? sameFillInBlank : sameAnswers)) return;

    const newMap = { ...customQuizData.quiz.questions };

    const updateFields = (mapKey) => {
      newMap[mapKey].question = question;
      newMap[mapKey].option_1 = answer_A;
      if (type !== "FillInTheBlank") {
        newMap[mapKey].option_2 = answer_B;
        newMap[mapKey].option_3 = answer_C;
        newMap[mapKey].option_4 = answer_D;
        newMap[mapKey].correct_answer = correctAnswer;
      }
    };

    if (!sameOrder) {
      const reorderedMap = {};
      let counter = 1;
      Object.keys(customQuizData.quiz.questions).forEach((key) => {
        if (`Question ${counter}` === num) {
          reorderedMap[`Question ${questionNum}`] = { ...customQuizData.quiz.questions[num] };
          updateFields(`Question ${questionNum}`);
        } else if (`Question ${counter}` === `Question ${questionNum}`) {
          reorderedMap[`Question ${counter}`] = { ...customQuizData.quiz.questions[num] };
        } else {
          reorderedMap[`Question ${counter}`] = customQuizData.quiz.questions[`Question ${counter}`];
        }
        counter++;
      });
      customQuizData.updateQuiz(prev => ({ ...prev, questions: reorderedMap }));
    } else {
      updateFields(num);
      customQuizData.updateQuiz(prev => ({ ...prev, questions: newMap }));
    }
  };

  const handleInputChange = (setter) => (e) => setter(e.target.value);

  useEffect(() => {
    editQuestion(q.question);
    editAnswer_A(q.option_1);
    editAnswer_B(q.option_2);
    editAnswer_C(q.option_3);
    editAnswer_D(q.option_4);
    changeCorrectAnswer(q.correct_answer);
    changeQuestionNum(num.split(" ")[1]);
  }, [customQuizData.quiz]);

  return (
    <div className="flex flex-col bg-gray-900 rounded-3xl shadow-lg m-5 p-4 items-center">
      {editingQuestion ? (
        <>
          <form className="flex w-10/12">
            <input
              type="number"
              min="1"
              max={customQuizData.quiz.numQuestions}
              onChange={handleInputChange(changeQuestionNum)}
              value={questionNum}
              className="bg-inherit text-black w-9 p-0 bg-slate-500 focus:bg-slate-300 mr-1 rounded"
            />
            <textarea
              value={question}
              onChange={handleInputChange(editQuestion)}
              className="bg-slate-400 focus:bg-slate-300 text-black w-full p-2 rounded"
            />
          </form>

          <div className="mt-3 p-2 flex flex-col items-start w-10/12">
            {["FillInTheBlank", "DragAndDrop"].includes(type) ? (
              <>
                {[answer_A, answer_B, answer_C, answer_D].map((val, idx) => (
                  <form key={idx} className="flex justify-center w-full mb-4">
                    <label className="mr-3">{String.fromCharCode(65 + idx)} :</label>
                    <textarea
                      value={val}
                      onChange={handleInputChange([editAnswer_A, editAnswer_B, editAnswer_C, editAnswer_D][idx])}
                      className="bg-slate-400 focus:bg-slate-300 w-full rounded p-1 text-black"
                    />
                  </form>
                ))}
                <form className="w-full mb-4 mt-1">
                  <label className="mr-2">Correct Answer:</label>
                  <input
                    type="text"
                    onChange={handleInputChange(changeCorrectAnswer)}
                    value={correctAnswer}
                    className="bg-slate-400 focus:bg-slate-300 text-black w-full p-1 rounded"
                  />
                </form>
              </>
            ) : (
              <>
                {[answer_A, answer_B, answer_C, answer_D].map((val, idx) => (
                  <form key={idx} className="flex justify-center w-full mb-4">
                    <label className="mr-3">{String.fromCharCode(65 + idx)} :</label>
                    <textarea
                      value={val}
                      onChange={handleInputChange([editAnswer_A, editAnswer_B, editAnswer_C, editAnswer_D][idx])}
                      className="bg-slate-400 focus:bg-slate-300 w-full rounded p-1 text-black"
                    />
                  </form>
                ))}
                {type === "Multiple" && (
                  <form className="w-full mb-4 mt-1">
                    <label className="mr-2">Correct Answer:</label>
                    <select
                      onChange={handleInputChange(changeCorrectAnswer)}
                      value={correctAnswer}
                      className="text-black w-full"
                    >
                      <option value="">--Select the correct answer--</option>
                      {[answer_A, answer_B, answer_C, answer_D].map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </form>
                )}
                {type === "MultipleAnswer" && (
                  <form className="w-full mb-4 mt-1">
                    <label className="mr-2">Correct Answers (separated by "||"):</label>
                    <input
                      type="text"
                      onChange={handleInputChange(changeCorrectAnswer)}
                      value={correctAnswer}
                      className="bg-slate-400 focus:bg-slate-300 text-black w-full p-1 rounded"
                    />
                  </form>
                )}
              </>
            )}

            <div className="w-full">
              <button onClick={handleFinishClick} className="border rounded p-2 mr-4">Finish</button>
              <button className="border rounded p-2 bg-red-600">Delete Question</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex">
            <h1>{questionNum}.&nbsp;&nbsp;</h1>
            <h1>{q.question}</h1>
          </div>
          <div className="mt-3 p-2 flex flex-col items-start w-10/12">
            {[q.option_1, q.option_2, q.option_3, q.option_4]
              .filter(Boolean)
              .map((opt, idx) => (
                <div key={idx} className="flex w-full mb-3">
                  <h2 className="bg-slate-400 w-full flex items-start ml-2 pl-2 rounded">{opt}</h2>
                </div>
              ))}
            <span className="bg-slate-400 w-full h-0.5" />
            <h1 className="mt-2">Correct Answer{type === "MultipleAnswer" ? "s" : ""}: {type === "MultipleAnswer" ? correctAnswer?.split("||").join(", ") : correctAnswer}</h1>
            <button onClick={() => toggleEditing(!editingQuestion)} className="mt-3 border rounded p-2">Edit Question</button>
          </div>
        </>
      )}
    </div>
  );
}

export default EditQuestion;