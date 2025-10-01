/* 
This component is for each question provided via a custom quiz.
- Component provides state for each input field that allows editing the question data.

- COMPONENT PARAMS ({num, q})}
    - num: string 
        # Always comes in as a string in the format "Question (whatver the question number is)"
        Ex: "Question 5"
        # this is also the key used to access the questions data from the custom quiz context provider 
            - customQuizData: customQuizContextProvider()
            # use "num" as the key to access questions in the quiz object provided via the custom quiz context. NECESSARY FOR HANDLING CHANGING A QUESTIONS NUMBER ORDER.
            Ex: customQuizData.quiz.questions[num]

    - q: object
        # q is the question object passed to the component so the data can be displayed and used for editing
        - Currently every question contains:
            - The Question
            - Answer A
            - Answer B
            - Answer C
            - Answer D
            - The Correct Answer
    
This component is what allows the editing capability of each individual question in a custom quiz. 
*/

import { useState, useEffect } from 'react'
import { useQuiz } from '../../contexts/QuizContext'

function EditQuestion({ num, q, index }) {
  // Normalize question data to work with both formats
  const normalizeQuestion = (questionData) => {
    // If it's already in new format (has 'type' field)
    if (questionData.type || questionData.questionType) {
      return {
        type: questionData.type || questionData.questionType || "multiple-choice",
        question: questionData.question,
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer || questionData.correct_answer,
        explanation: questionData.explanation || "",
        points: questionData.points || 1,
        difficulty: questionData.difficulty || "3"
      };
    }
    
    // OLD format - array like ["question", "opt1", "opt2", "opt3", "opt4", "answer", "type"]
    if (Array.isArray(questionData)) {
      return {
        type: questionData[6] === "TrueFalse" ? "true-false" : 
              questionData[6] === "FillInTheBlank" ? "fill-blank" : "multiple-choice",
        question: questionData[0],
        options: questionData[6] === "FillInTheBlank" ? [questionData[1]] : 
                 [questionData[1], questionData[2], questionData[3], questionData[4]].filter(Boolean),
        correctAnswer: questionData[5],
        explanation: "",
        points: 1,
        difficulty: "3"
      };
    }
    
    // OLD format - object like {question, option_1, option_2, ...}
    return {
      type: questionData.questionType || "multiple-choice",
      question: questionData.question,
      options: [questionData.option_1, questionData.option_2, 
                questionData.option_3, questionData.option_4].filter(Boolean),
      correctAnswer: questionData.correct_answer,
      explanation: questionData.explanation || "",
      points: questionData.points || 1,
      difficulty: questionData.difficulty || "3"
    };
  };

  const normalized = normalizeQuestion(q);
  const type = normalized.type;
  
  const [editingQuestion, toggleEditing] = useState(false);
  const [question, editQuestion] = useState(normalized.question);
  const [questionNum, changeQuestionNum] = useState(num.split(" ")[1]);
  const [answers, setAnswers] = useState(normalized.options);
  const [selectedCorrectAnswers, setSelectedCorrectAnswers] = useState([]);
  const [correctAnswer, changeCorrectAnswer] = useState(normalized.correctAnswer);

  const isMultipleAnswer = type === "multiple-answer";
  const customQuizData = useQuiz();

  const handleFinishClick = () => {
    toggleEditing(false);

    // Get current normalized question for comparison
    const currentNormalized = normalizeQuestion(customQuizData.quiz.questions[num]);
    
    const sameQuestion = currentNormalized.question === question;
    const sameOrder = num.split(" ")[1] === questionNum;
    const sameAnswers = JSON.stringify(currentNormalized.options) === JSON.stringify(answers);
    const sameCorrectAnswer = currentNormalized.correctAnswer === correctAnswer;

    if (sameQuestion && sameOrder && sameAnswers && sameCorrectAnswer) return;

    const newMap = { ...customQuizData.quiz.questions };

    const updateFields = (mapKey) => {
      // Create new format question object
      const updatedQuestion = {
        id: `q${questionNum}`,
        type: type,
        question: question,
        options: type === "fill-blank" ? [answers[0]] : answers.filter(a => a.trim() !== ''),
        correctAnswer: isMultipleAnswer
          ? selectedCorrectAnswers.join("||")
          : correctAnswer,
        explanation: normalized.explanation,
        points: normalized.points,
        category: "",
        difficulty: normalized.difficulty
      };
      
      newMap[mapKey] = updatedQuestion;
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

  const handleCheckboxChange = (option) => {
    setSelectedCorrectAnswers(prev =>
      prev.includes(option)
        ? prev.filter(val => val !== option)
        : [...prev, option]
    );
  };

  useEffect(() => {
    const currentNormalized = normalizeQuestion(customQuizData.quiz.questions[num]);
    editQuestion(currentNormalized.question);
    
    // Ensure we have 4 slots for answers
    const paddedAnswers = [...currentNormalized.options];
    while (paddedAnswers.length < 4) {
      paddedAnswers.push('');
    }
    setAnswers(paddedAnswers);
    
    changeCorrectAnswer(currentNormalized.correctAnswer);
    changeQuestionNum(num.split(" ")[1]);

    if (type === "multiple-answer") {
      const splitAnswers = currentNormalized.correctAnswer?.split("||").map(s => s.trim()) || [];
      setSelectedCorrectAnswers(splitAnswers);
    }
  }, [customQuizData.quiz, num]);

  const updateAnswer = (index, value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  return (
    <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent">
      {editingQuestion ? (
        <>
          {/* Editing Mode */}
          <div className="space-y-6">
            {/* Question Number and Text */}
            <div className="flex gap-4 items-start">
              <input
                type="number"
                min="1"
                max={customQuizData.quiz.numQuestions}
                onChange={(e) => changeQuestionNum(e.target.value)}
                value={questionNum}
                className="w-20 px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
              />
              <textarea
                value={question}
                onChange={(e) => editQuestion(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover resize-none"
                rows={3}
                placeholder="Enter your question"
              />
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {type === "fill-blank" ? (
                <div className="space-y-2">
                  <label className="block text-base font-medium text-secondary">Answer:</label>
                  <textarea
                    value={answers[0] || ''}
                    onChange={(e) => updateAnswer(0, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover resize-none"
                    rows={2}
                    placeholder="Enter the correct answer"
                  />
                </div>
              ) : (
                <>
                  {answers.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <label className="text-base font-medium text-secondary min-w-[2rem]">
                        {String.fromCharCode(65 + idx)}:
                      </label>
                      <textarea
                        value={val || ''}
                        onChange={(e) => updateAnswer(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover resize-none"
                        rows={2}
                        placeholder={`Enter option ${String.fromCharCode(65 + idx)}`}
                      />
                      {type === "multiple-answer" && (
                        <input
                          type="checkbox"
                          checked={selectedCorrectAnswers.includes(val)}
                          onChange={() => handleCheckboxChange(val)}
                          className="w-5 h-5 text-accent bg-input border-accent rounded focus:ring-accent"
                        />
                      )}
                    </div>
                  ))}

                  {type === "multiple-choice" && (
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-secondary">Correct Answer:</label>
                      <select
                        onChange={(e) => changeCorrectAnswer(e.target.value)}
                        value={correctAnswer}
                        className="w-full px-3 py-2 rounded-lg bg-input text-primary border border-accent focus:border-accent-hover"
                      >
                        <option value="">--Select the correct answer--</option>
                        {answers.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt || `Option ${String.fromCharCode(65 + idx)}`}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleFinishClick} 
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent"
              >
                Finish
              </button>
              <button 
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-red-600"
              >
                Delete Question
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Display Mode */}
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-start gap-4">
              <h1 className="text-2xl font-semibold text-gradient-primary">{questionNum}.</h1>
              <h1 className="text-xl text-primary flex-1">{normalized.question}</h1>
            </div>

            {/* Answer Options Display */}
            <div className="space-y-3 pl-8">
              {normalized.options
                .filter(opt => opt && opt.trim() !== '')
                .map((opt, idx) => (
                  <div key={idx} className="bg-input rounded-lg p-3 border border-accent">
                    <span className="font-medium text-secondary mr-2">
                      {type === "fill-blank" ? "Answer:" : `${String.fromCharCode(65 + idx)}:`}
                    </span>
                    <span className="text-primary">{opt}</span>
                  </div>
                ))}
            </div>

            {/* Correct Answer Section */}
            <div className="border-t border-accent pt-4">
              <div className="bg-accent bg-opacity-10 rounded-lg p-4 border border-accent">
                <h2 className="text-lg font-semibold text-accent mb-2">
                  Correct Answer{type === "multiple-answer" ? "s" : ""}:
                </h2>
                <p className="text-primary">
                  {type === "multiple-answer" 
                    ? normalized.correctAnswer?.split("||").join(", ") 
                    : normalized.correctAnswer
                  }
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="pt-4">
              <button 
                onClick={() => toggleEditing(!editingQuestion)} 
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-accent"
              >
                Edit Question
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EditQuestion