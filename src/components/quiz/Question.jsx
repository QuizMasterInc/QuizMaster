import React, { useState, useEffect } from 'react';

function Question({ question, onAnswer, isCompleted, onAnswerChange, answerCount }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [inputAnswer, setInputAnswer] = useState('');
  const [droppedOption, setDroppedOption] = useState('');
  const [hasBeenCounted, setHasBeenCounted] = useState(false);

  const qText = question.questionText ?? question.text ?? '';

  const type = question.type?.toLowerCase();
  const isFillBlank = type === 'fill';
  const isMultipleAnswer = type === 'multiple';
  const isDragAndDrop = type === 'drag';

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

      if (onAnswer) onAnswer(isCorrect);
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

  return (
    <div className="flex flex-col w-7/12 p-4 mb-4 bg-gray-900 text-white rounded-lg shadow-lg -md:pl-2 -md:pr-2 -md:pb-2 -md:w-10/12">
      <p className="text-lg font-semibold mb-4">
        {isDragAndDrop && qText.includes('[blank]')
          ? qText.replace('[blank]', droppedOption || '________')
          : qText}
      </p>

      {isDragAndDrop ? (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {question.choices.slice(0, answerCount).map((opt, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', opt)}
                className="px-4 py-2 bg-gray-600 rounded cursor-move hover:bg-gray-500"
              >
                {opt}
              </div>
            ))}
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const data = e.dataTransfer.getData('text/plain');
              setDroppedOption(data);
            }}
            className="w-full h-16 flex items-center justify-center border-2 border-dashed border-blue-400 bg-gray-700 text-white rounded-md mb-4"
          >
            Drop your answer here
          </div>
        </>
      ) : isFillBlank ? (
        <input
          type="text"
          value={inputAnswer}
          onChange={(e) => setInputAnswer(e.target.value)}
          disabled={isCompleted}
          className="p-2 rounded w-full text-black mt-2"
          placeholder="Type your answer here"
        />
      ) : (
        <div className="choices mt-4 space-y-2">
          {question.choices.slice(0, answerCount).map((choice, idx) =>
            isMultipleAnswer ? (
              <label key={idx} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIndexes.includes(idx)}
                  onChange={() => handleChoiceClick(idx)}
                  disabled={isCompleted}
                />
                <span>{choice}</span>
              </label>
            ) : (
              <button
                key={idx}
                onClick={() => handleChoiceClick(idx)}
                disabled={isCompleted}
                className={`block w-full text-left p-2 rounded ${
                  selectedIndex === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {choice}
              </button>
            )
          )}
        </div>
      )}
    </div>
    )
}

export default Question;
