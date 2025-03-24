import React, { useState } from 'react';

function Question({ question, onAnswer }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [inputAnswer, setInputAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [droppedOption, setDroppedOption] = useState('');

  const isFillBlank = question.type === 'fill' || (!question.choices || question.choices.length === 0);
  const isMultipleAnswer = question.type === 'multiple' || (question.correctAnswer && question.correctAnswer.includes('||'));
  const isDragAndDrop = question.type === 'drag';

  const handleChoiceClick = (index) => {
    if (answered) return;

    if (isMultipleAnswer) {
      setSelectedIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setSelectedIndex(index);
    }
  };

  const handleSubmit = () => {
    if (answered) return;
    let correct = false;

    if (isFillBlank) {
      correct = inputAnswer.trim() === String(question.correctAnswer).trim();
    } else if (isMultipleAnswer) {
      const correctAnswers = String(question.correctAnswer).split('||').map((ans) => ans.trim());
      const selectedTexts = selectedIndexes.map((i) => question.choices[i]);
      correct =
        selectedTexts.length === correctAnswers.length &&
        selectedTexts.every((ans) => correctAnswers.includes(ans));
    } else if (isDragAndDrop) {
      correct = droppedOption === String(question.correctAnswer).trim();
    } else {
      if (selectedIndex !== null) {
        correct = question.choices[selectedIndex] === question.correctAnswer;
      }
    }

    setAnswered(true);
    if (onAnswer) {
      onAnswer(correct);
    }
  };

  return (
    <div className="question p-4 bg-gray-800 text-white rounded-md mb-6 shadow-md">
      <p className="text-lg font-semibold mb-4">{question.text}</p>

      {isDragAndDrop ? (
        <>
          {/* Draggable Choices */}
          <div className="flex flex-wrap gap-2 mb-4">
            {question.choices.map((opt, idx) => (
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

          {/* Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const data = e.dataTransfer.getData('text/plain');
              setDroppedOption(data);
            }}
            className="w-full h-16 flex items-center justify-center border-2 border-dashed border-blue-400 bg-gray-700 text-white rounded-md mb-4"
          >
            {question.text.includes('[blank]')
              ? question.text.replace('[blank]', droppedOption || '________')
              : 'This question must include [blank]'}
          </div>
        </>
      ) : isFillBlank ? (
        <input
          type="text"
          value={inputAnswer}
          onChange={(e) => setInputAnswer(e.target.value)}
          disabled={answered}
          className="p-2 rounded w-full text-black mt-2"
        />
      ) : (
        <div className="choices mt-4 space-y-2">
          {question.choices.map((choice, idx) =>
            isMultipleAnswer ? (
              <label key={idx} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIndexes.includes(idx)}
                  onChange={() => handleChoiceClick(idx)}
                  disabled={answered}
                />
                <span>{choice}</span>
              </label>
            ) : (
              <button
                key={idx}
                onClick={() => handleChoiceClick(idx)}
                disabled={answered}
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

      <button
        onClick={handleSubmit}
        disabled={answered}
        className="mt-4 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
}

export default Question;