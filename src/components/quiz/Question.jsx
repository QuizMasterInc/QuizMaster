import { useState, useEffect } from 'react';
import { Flag } from '../icons';

function Question({
  question,
  questionIndex,
  onAnswer,
  isCompleted,
  onAnswerChange,
  answerCount,
  onReviewToggle,
  savedAnswer,
  isMarkedForReview = false
}) {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (savedAnswer && question.choices && typeof savedAnswer === 'string') {
      const idx = question.choices.findIndex(c => c === savedAnswer);
      return idx >= 0 ? idx : null;
    }
    return null;
  });

  const [selectedIndexes, setSelectedIndexes] = useState(() => {
    if (Array.isArray(savedAnswer) && question.choices) {
      return savedAnswer
        .map(ans => question.choices.findIndex(c => c === ans))
        .filter(i => i >= 0);
    }
    return [];
  });

  const [inputAnswer, setInputAnswer] = useState(() => {
    if (savedAnswer && typeof savedAnswer === 'string') {
      return savedAnswer;
    }
    return '';
  });

  const [droppedOption, setDroppedOption] = useState(() => {
    if (savedAnswer && typeof savedAnswer === 'string') {
      return savedAnswer;
    }
    return '';
  });

  const [hasBeenCounted, setHasBeenCounted] = useState(!!savedAnswer);
  const [evaluatedCorrect, setEvaluatedCorrect] = useState(null);

  const qText = question.questionText ?? question.text ?? '';

  const type = question.type?.toLowerCase();
  const isFillBlank = type === 'fill';
  const isMultipleAnswer = type === 'multiple';
  const isDragAndDrop = type === 'drag';

  // Report answer to parent whenever it changes (for auto-save)
  useEffect(() => {
    if (isCompleted) return;
    
    let currentAnswer = null;
    
    if (isFillBlank) {
      currentAnswer = inputAnswer.trim() || null;
    } else if (isMultipleAnswer) {
      currentAnswer = selectedIndexes.length > 0 ? selectedIndexes.map(i => question.choices[i]) : null;
    } else if (isDragAndDrop) {
      currentAnswer = droppedOption || null;
    } else if (selectedIndex !== null) {
      currentAnswer = question.choices[selectedIndex] || null;
    }
    
    if (currentAnswer !== null && onAnswer) {
      onAnswer(questionIndex, null, currentAnswer);
    }
  }, [inputAnswer, selectedIndexes, droppedOption, selectedIndex]);

  useEffect(() => {
    if (isCompleted) {
      let isCorrect = false;

      if (isFillBlank) {
        const user = inputAnswer.trim().toLowerCase();
        const correct = String(question.correctAnswer).trim().toLowerCase();
        isCorrect = user === correct;
      } else if (isMultipleAnswer) {
        const correctAnswers = String(question.correctAnswer)
          .split('||')
          .map((a) => a.trim().toLowerCase());

        const selectedTexts = selectedIndexes.map((i) =>
          question.choices[i]?.trim().toLowerCase()
        );

        isCorrect =
          selectedTexts.length === correctAnswers.length &&
          selectedTexts.every((ans) => correctAnswers.includes(ans));
      } else if (isDragAndDrop) {
        isCorrect =
          droppedOption.trim().toLowerCase() ===
          String(question.correctAnswer).trim().toLowerCase();
      } else {
        if (selectedIndex !== null) {
          const selected = question.choices[selectedIndex]
            ?.trim()
            .toLowerCase();
          const correct = String(question.correctAnswer)
            .trim()
            .toLowerCase();
          isCorrect = selected === correct;
        }
      }

      setEvaluatedCorrect(isCorrect);
      if (onAnswer) onAnswer(questionIndex, isCorrect);
    }
  }, [isCompleted]);

  useEffect(() => {
    if (!hasBeenCounted) {
      const interacted = isFillBlank
        ? inputAnswer.trim() !== ''
        : isMultipleAnswer
        ? selectedIndexes.length > 0
        : isDragAndDrop
        ? droppedOption.trim() !== ''
        : selectedIndex !== null;

      if (interacted) {
        if (onAnswerChange) onAnswerChange(true);
        setHasBeenCounted(true);
      }
    }
  }, [inputAnswer, selectedIndexes, droppedOption, selectedIndex]);

  const handleChoiceClick = (index) => {
    if (isCompleted) return;

    if (isMultipleAnswer) {
      setSelectedIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setSelectedIndex(index);
    }
  };

  const handleToggleReview = () => {
    const newValue = !isMarkedForReview;
    if (onReviewToggle) {
      onReviewToggle(questionIndex, newValue);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-primary leading-relaxed">
          {isDragAndDrop && qText.includes('[blank]')
            ? qText.replace('[blank]', droppedOption || '________')
            : qText}
        </h3>
      </div>

      {/* Answer Options */}
      <div className="space-y-4">
        {isDragAndDrop ? (
          <>
            {/* Draggable Options */}
            <div className="flex flex-wrap gap-3 mb-6">
              {question.choices.slice(0, answerCount).map((opt, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', opt)}
                  className="px-4 py-2 bg-[var(--neutral-200)] text-black rounded-lg cursor-move hover:bg-[var(--neutral-300)] transition-colors duration-200 border border-primary"
                >
                  {opt}
                </div>
              ))}
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                setDroppedOption(data);
              }}
              className="w-full h-16 flex items-center justify-center border-2 border-dashed border-accent bg-input text-secondary rounded-lg"
            >
              {droppedOption || 'Drop your answer here'}
            </div>
          </>
        ) : isFillBlank ? (
          <input
            type="text"
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            disabled={isCompleted}
            className="w-full p-4 rounded-lg bg-[var(--neutral-200)] text-black border border-primary placeholder-[var(--neutral-600)] focus:outline-[var(--primary-400)] transition-colors duration-200"
            placeholder="Type your answer here"
          />
        ) : (
          <div className="space-y-3">
            {question.choices.slice(0, answerCount).map((choice, idx) =>
              isMultipleAnswer ? (
                <label 
                  key={idx} 
                  className="flex items-center space-x-3 p-4 bg-[var(--neutral-200)] text-black rounded-lg cursor-pointer hover:bg-[var(--neutral-300)] transition-colors duration-200 border border-primary"
                >
                  <input
                    type="checkbox"
                    checked={selectedIndexes.includes(idx)}
                    onChange={() => handleChoiceClick(idx)}
                    disabled={isCompleted}
                    className="w-5 h-5 text-accent border-primary rounded focus:ring-accent"
                  />
                  <span className="text-lg text-black">{choice}</span>
                </label>
              ) : (
                <button
                  key={idx}
                  onClick={() => handleChoiceClick(idx)}
                  disabled={isCompleted}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 border ${
                    selectedIndex === idx
                      ? 'bg-accent text-btn-primary border-accent shadow-lg'
                      : 'bg-[var(--neutral-200)] text-black border-primary hover:bg-[var(--neutral-300)] hover:shadow-md'
                  }`}
                >
                  <span className="text-lg">{choice}</span>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {!isCompleted && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleToggleReview}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 ${
              isMarkedForReview
                ? 'bg-yellow-500 border-yellow-500 text-black'
                : 'bg-transparent border-gray-400 text-secondary hover:border-gray-500'
            }`}
          >
            <Flag className={`w-4 h-4 ${isMarkedForReview ? 'fill-black' : 'fill-current'}`} />
            {isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Question;