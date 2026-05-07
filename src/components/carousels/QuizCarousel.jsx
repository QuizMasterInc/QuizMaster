import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const QuizCarousel = ({ title = "Suggested Quizzes", quizzes = [], renderQuizCard, emptyMessage = "No quizzes available yet." }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;

        const scrollAmount = 320;

        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const quizzesToShow = quizzes.slice(0, 6);

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h2>

                {quizzesToShow.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scroll("left")}
                            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm"
                            aria-label="Scroll left"
                        >
                            <FaChevronLeft size={16} />
                        </button>

                        <button
                            type="button"
                            onClick={() => scroll("right")}
                            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm"
                            aria-label="Scroll right"
                        >
                            <FaChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {quizzesToShow.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {emptyMessage}
                </p>
            ) : (
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-1 no-scrollbar"
                >
                    {quizzesToShow.map((quiz, index) => (
                        <div
                            key={quiz.id || quiz.uid || quiz.quizId || quiz.title || index}
                            className="min-w-[340px] max-w-[380px] flex-shrink-0"
                        >
                            {renderQuizCard ? renderQuizCard(quiz) : null}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default QuizCarousel;