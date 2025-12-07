/**
 * QuestionCreationForm Component
 * Handles manual question creation with all question types
 */

import { useState } from 'react';
import { QUESTION_TYPES } from '../../../utils/questionTypes';

export default function QuestionCreationForm({
  currentQuestion,
  onQuestionChange,
  numAnswers,
  onNumAnswersChange,
  selectedCorrectAnswers,
  onCorrectAnswersChange
}) {
  const [droppedOption, setDroppedOption] = useState('');

  // Update number of answer options
  const updateNumAnswers = (newNum) => {
    onNumAnswersChange(newNum);
    
    // Clear options beyond the new limit
    for (let i = newNum + 1; i <= 4; i++) {
      onQuestionChange('', i);
    }
  };

  return (
    <div className="space-y-8">
      {/* Question Text */}
      <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
          ❓ Your Question
        </h2>
        <input
          id="question"
          type="text"
          placeholder="Enter your question"
          value={currentQuestion[0]}
          onChange={(e) => onQuestionChange(e.target.value, 0)}
          className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
        />
      </div>

      {/* Question Type */}
      <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
          📝 Question Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-secondary font-medium md:text-right">Type:</label>
          <div className="md:col-span-3">
            <select
              value={currentQuestion[6]}
              onChange={(e) => onQuestionChange(e.target.value, 6)}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
            >
              <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice</option>
              <option value={QUESTION_TYPES.TRUE_FALSE}>True/False</option>
              <option value={QUESTION_TYPES.FILL_IN_BLANK}>Fill in the Blank</option>
              <option value={QUESTION_TYPES.MULTIPLE_ANSWER}>Multiple Answer</option>
              <option value={QUESTION_TYPES.DRAG_AND_DROP}>Drag and Drop</option>
            </select>
          </div>
        </div>
      </div>

      {/* Answer Options (Multiple Choice, Multiple Answer, Drag and Drop) */}
      {(currentQuestion[6] === QUESTION_TYPES.MULTIPLE_CHOICE || 
        currentQuestion[6] === QUESTION_TYPES.MULTIPLE_ANSWER || 
        currentQuestion[6] === QUESTION_TYPES.DRAG_AND_DROP) && (
        <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
            📋 Answer Options
          </h2>

          {/* Number of Answers Selector */}
          <div className="mb-6">
            <label className="block text-secondary font-medium mb-2">
              Number of Answer Options
            </label>
            <select
              value={numAnswers}
              onChange={(e) => updateNumAnswers(parseInt(e.target.value, 10))}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
            >
              <option value={2}>2 Answers</option>
              <option value={3}>3 Answers</option>
              <option value={4}>4 Answers</option>
            </select>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].slice(0, numAnswers).map((idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-secondary font-medium md:text-right">
                  Option {idx}:
                </label>
                <div className="md:col-span-3 flex gap-2">
                  <input
                    type="text"
                    value={currentQuestion[idx]}
                    onChange={(e) => onQuestionChange(e.target.value, idx)}
                    className="flex-1 bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                    placeholder={`Option ${idx}`}
                  />
                  {currentQuestion[6] === QUESTION_TYPES.MULTIPLE_ANSWER && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCorrectAnswers[idx - 1]}
                        onChange={() => {
                          const newSelected = [...selectedCorrectAnswers];
                          newSelected[idx - 1] = !newSelected[idx - 1];
                          onCorrectAnswersChange(newSelected);
                        }}
                        className="w-5 h-5 text-accent bg-card border-primary rounded focus:ring-accent"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {currentQuestion[6] === QUESTION_TYPES.DRAG_AND_DROP && (
            <div className="mt-6 space-y-4">
              <p className="text-secondary text-sm">
                💡 Drag and drop requires [blank] in your question text. Users will drag the correct option.
              </p>
              <div
                className="w-full min-h-[4rem] flex items-center justify-center border-2 border-dashed border-accent rounded-lg bg-secondary text-center p-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = e.dataTransfer.getData('text/plain');
                  setDroppedOption(data);
                }}
              >
                <span className="text-secondary">
                  {currentQuestion[0].includes('[blank]')
                    ? currentQuestion[0].replace('[blank]', droppedOption || '________')
                    : 'Your question must include [blank]'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fill in the Blank */}
      {currentQuestion[6] === QUESTION_TYPES.FILL_IN_BLANK && (
        <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
            ✍️ Correct Answer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Answer:</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={currentQuestion[1]}
                onChange={(e) => onQuestionChange(e.target.value, 1)}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Enter the correct answer"
              />
            </div>
          </div>
        </div>
      )}

      {/* True/False Selection */}
      {currentQuestion[6] === QUESTION_TYPES.TRUE_FALSE && (
        <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
            ✅ Correct Answer
          </h2>
          <div className="flex gap-6 justify-center">
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="radio"
                value="True"
                checked={currentQuestion[5] === 'True'}
                onChange={(e) => onQuestionChange(e.target.value, 5)}
                className="w-5 h-5 text-accent bg-card border-primary focus:ring-accent"
              />
              <span className="text-lg">True</span>
            </label>
            <label className="flex items-center gap-3 text-secondary cursor-pointer">
              <input
                type="radio"
                value="False"
                checked={currentQuestion[5] === 'False'}
                onChange={(e) => onQuestionChange(e.target.value, 5)}
                className="w-5 h-5 text-accent bg-card border-primary focus:ring-accent"
              />
              <span className="text-lg">False</span>
            </label>
          </div>
        </div>
      )}

      {/* Correct Answer Selection (Multiple Choice) */}
      {currentQuestion[6] === QUESTION_TYPES.MULTIPLE_CHOICE && (
        <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
            ✅ Correct Answer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">
              Select correct option:
            </label>
            <div className="md:col-span-3">
              <select
                value={currentQuestion[5]}
                onChange={(e) => onQuestionChange(e.target.value, 5)}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              >
                <option value="">Select correct answer</option>
                {[1, 2, 3, 4].slice(0, numAnswers).map((idx) => (
                  <option key={idx} value={currentQuestion[idx]}>
                    {currentQuestion[idx] || `Option ${idx}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Correct Answer for Drag and Drop */}
      {currentQuestion[6] === QUESTION_TYPES.DRAG_AND_DROP && (
        <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
            ✅ Correct Answer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">Answer:</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={currentQuestion[5]}
                onChange={(e) => onQuestionChange(e.target.value, 5)}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Correct answer (must match one of the options)"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
