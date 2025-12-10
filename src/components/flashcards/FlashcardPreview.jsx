/**
 * FlashcardPreview Component
 * Interactive preview of flashcard deck with flip-on-hover (desktop) or tap-to-flip (mobile)
 * Shows 1 card by default with "Show More" to expand
 */

import { useState, useEffect } from 'react';

export default function FlashcardPreview({ cards }) {
    const [showAll, setShowAll] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [flippedIndex, setFlippedIndex] = useState(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // Detect touch device on mount
    useEffect(() => {
        const checkTouch = () => {
            return (
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0
            );
        };
        setIsTouchDevice(checkTouch());
    }, []);

    // Auto-flip back on mobile after 2 seconds
    useEffect(() => {
        if (isTouchDevice && flippedIndex !== null) {
            const timer = setTimeout(() => {
                setFlippedIndex(null);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [flippedIndex, isTouchDevice]);

    if (!cards || Object.keys(cards).length === 0) {
        return null;
    }

    const cardEntries = Object.entries(cards);
    const displayedCards = showAll ? cardEntries : cardEntries.slice(0, 1);

    const handleCardInteraction = (index) => {
        if (isTouchDevice) {
            // Mobile: toggle flip state
            setFlippedIndex(flippedIndex === index ? null : index);
        }
    };

    const isFlipped = (index) => {
        return isTouchDevice ? flippedIndex === index : hoveredIndex === index;
    };

    return (
        <div className="mt-4">
            <div className="text-sm text-primary mb-2">
                <strong>Preview:</strong>
            </div>
            
            <div className="space-y-3">
                {displayedCards.map(([cardId, card], index) => (
                    <div
                        key={cardId}
                        className="perspective-1000 cursor-pointer"
                        onMouseEnter={() => !isTouchDevice && setHoveredIndex(index)}
                        onMouseLeave={() => !isTouchDevice && setHoveredIndex(null)}
                        onClick={() => handleCardInteraction(index)}
                    >
                        <div
                            className={`relative w-full h-32 transition-transform duration-500 transform-style-3d ${
                                isFlipped(index) ? 'rotate-y-180' : ''
                            }`}
                        >
                            {/* Front of card */}
                            <div className="absolute w-full h-full backface-hidden">
                                <div className="h-full flex flex-col justify-center p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
                                    <div className="text-xs text-[var(--text-muted)] mb-1">Front</div>
                                    <div className="text-sm text-[var(--text-primary)] line-clamp-3">
                                        {card.front}
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)] mt-2 italic">
                                        {isTouchDevice ? 'Tap to see answer' : 'Hover to see answer'}
                                    </div>
                                </div>
                            </div>

                            {/* Back of card */}
                            <div className="absolute w-full h-full backface-hidden rotate-y-180">
                                <div className="h-full flex flex-col justify-center p-4 bg-[var(--primary-400)] rounded-lg border border-[var(--accent)]">
                                    <div className="text-xs text-white/80 mb-1">Back</div>
                                    <div className="text-sm text-white line-clamp-3">
                                        {card.back}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More/Less Button */}
            {cardEntries.length > 1 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-3 w-full py-2 text-sm text-[var(--primary-400)] hover:text-[var(--primary-500)] font-medium transition-colors"
                >
                    {showAll ? (
                        <>Show Less ↑</>
                    ) : (
                        <>Show {cardEntries.length - 1} More Card{cardEntries.length - 1 !== 1 ? 's' : ''} ↓</>
                    )}
                </button>
            )}
        </div>
    );
}
