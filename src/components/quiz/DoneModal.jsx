import { useState } from "react";
import Modal from "react-modal";
import { SquareX } from "../icons";
import { Link } from "react-router-dom";

const DoneModal = ({ isActive, amountCorrect, totalAmount, active, questions = [], userAnswers = {}, quizId, isCustomQuiz = false, onViewDetails }) => {
    const [showDetails, setShowDetails] = useState(false);

    console.log('Modal open')

    return (
        <Modal
            isOpen={active}
            contentLabel="Done Modal"
            ariaHideApp={false}
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(5px)",
                    zIndex: 1000,
                },
                content: {
                    background: "transparent",
                    outline: "none",
                    border: "none",
                    padding: 0,
                },
            }}
        >
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="bg-card rounded-3xl shadow-xl border border-accent">
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-primary">
                            <h2 className="text-3xl font-semibold text-gradient-primary">
                                {showDetails ? "Detailed Results" : "Quiz Results!"}
                            </h2>
                            <div className="flex items-center gap-4">
                                {questions.length > 0 && !showDetails && (
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 text-sm"
                                        onClick={() => {
                                            if (onViewDetails) {
                                                onViewDetails();
                                            } else {
                                                setShowDetails(true);
                                            }
                                        }}
                                    >
                                        View Details
                                    </button>
                                )}
                                {showDetails && (
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-black rounded-lg font-medium transition-all duration-200 text-sm"
                                        onClick={() => setShowDetails(false)}
                                    >
                                        Back to Summary
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="text-secondary hover:text-accent transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--neutral-200)]"
                                    onClick={() => isActive(false)}
                                >
                                    <SquareX className="w-8 h-8" />
                                </button>
                            </div>
                        </div>

                        {!showDetails ? (
                            <>
                                {/* Score Display */}
                                <div className="p-8">
                                    <div className="text-center">
                                        <div className="text-8xl font-bold text-gradient-primary mb-4">
                                            {amountCorrect}/{totalAmount}
                                        </div>
                                        <p className="text-xl text-secondary">
                                            You answered {amountCorrect} out of {totalAmount} questions correctly
                                        </p>
                                        <div className="mt-4">
                                            <div className="text-2xl font-semibold text-accent">
                                                {Math.round((amountCorrect / totalAmount) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-center gap-4 p-8 border-t border-primary">
                                    <Link to="/typeofquiz">
                                        <button
                                            type="button"
                                            className="px-6 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                                            onClick={() => isActive(false)}
                                        >
                                            Take Another Quiz!
                                        </button>
                                    </Link>

                                    <Link to="/dashboard">
                                        <button
                                            type="button"
                                            className="px-6 py-3 bg-[var(--neutral-200)] text-black rounded-lg font-medium transition-all duration-200 hover:bg-[var(--neutral-300)] hover:shadow-lg border border-primary"
                                            onClick={() => isActive(false)}
                                        >
                                            View Dashboard
                                        </button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            /* Detailed Results */
                            <div className="p-8">
                                <div className="space-y-6">
                                    {questions.map((question, index) => {
                                        const userAnswer = userAnswers[index];
                                        const isCorrect = (() => {
                                            if (!userAnswer) return false;
                                            const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
                                            const userAns = Array.isArray(userAnswer) 
                                                ? userAnswer.map(a => a.toLowerCase().trim())
                                                : [String(userAnswer).toLowerCase().trim()];
                                            
                                            if (question.type === 'multiple') {
                                                const correctAnswers = correctAnswer.split('||').map(a => a.trim().toLowerCase());
                                                return userAns.length === correctAnswers.length && 
                                                       userAns.every(ans => correctAnswers.includes(ans));
                                            } else {
                                                return userAns[0] === correctAnswer;
                                            }
                                        })();

                                        return (
                                            <div key={index} className={`p-6 rounded-xl border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-primary flex-1">
                                                        Question {index + 1}: {question.questionText}
                                                    </h3>
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="font-medium text-secondary">Your Answer: </span>
                                                        <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                                            {Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || 'No answer')}
                                                        </span>
                                                    </div>
                                                    {!isCorrect && (
                                                        <div>
                                                            <span className="font-medium text-secondary">Correct Answer: </span>
                                                            <span className="text-green-700">{question.correctAnswer}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {question.choices && question.choices.length > 0 && (
                                                    <div className="mt-4">
                                                        <span className="font-medium text-secondary">Options: </span>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {question.choices.map((choice, choiceIndex) => (
                                                                <span key={choiceIndex} className="px-3 py-1 bg-white rounded border text-sm">
                                                                    {choice}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DoneModal;
