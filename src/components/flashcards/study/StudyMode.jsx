import { useMemo, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../../contexts/AuthContext';
import { useStudySession } from '../../../hooks/useStudySession';
import { useCardPreview } from '../../../hooks/useCardPreview';
import StudyCard from './StudyCard';
import StudyProgressBar from './StudyProgressBar';
import RatingButtons from './RatingButtons';
import StudyStats from './StudyStats';
import StudySearchBar from './StudySearchBar';
import { updateSessionProgress } from '../../../services/flashcards/studySession';
import NavButtons from './NavButtons';

/**
 * StudyMode - Main study session container
 * Orchestrates study flow with search/preview functionality
 */
const StudyMode = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const location = useLocation();

    const {
        session,
        deck,
        currentCard,
        currentCardIndex,
        setCurrentCardIndex,
        isFlipped,
        loading,
        error,
        cards,
        stats,
        handleFlip,
        handleRating,
        saveSession
    } = useStudySession(deckId, currentUser?.uid);

    // Search and preview mode logic
    const {
        searchTerm,
        setSearchTerm,
        filteredResults,
        clearSearch,
        previewMode,
        studyPosition,
        handleJumpToCard,
        handleReturnToStudy
    } = useCardPreview(cards, currentCardIndex, setCurrentCardIndex);

    const buttonsRef = useRef(null);
    const [toggleState, setToggleState] = useState(false);

    // --- Review Again (Still Learning-only) ---
    const [difficultCardIds, setDifficultCardIds] = useState(() => new Set());
    const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
    const [isReviewingDifficult, setIsReviewingDifficult] = useState(false);
    const [difficultIndices, setDifficultIndices] = useState([]);
    const [difficultPtr, setDifficultPtr] = useState(0);

    const difficultCount = difficultCardIds.size;

    const markDifficult = (cardId) => {
        if (!cardId) return;
        setDifficultCardIds((prev) => {
            const next = new Set(prev);
            next.add(cardId);
            return next;
        });
    };

    const unmarkDifficult = (cardId) => {
        if (!cardId) return;
        setDifficultCardIds((prev) => {
            if (!prev.has(cardId)) return prev;
            const next = new Set(prev);
            next.delete(cardId);
            return next;
        });
    };

    const buildDifficultIndices = useMemo(() => {
        // Preserve original deck order
        return (cards || []).reduce((acc, c, idx) => {
            if (difficultCardIds.has(c?.id)) acc.push(idx);
            return acc;
        }, []);
    }, [cards, difficultCardIds]);

    const startDifficultReview = () => {
        const idxs = buildDifficultIndices;
        if (!idxs || idxs.length === 0) return;

        // Exit preview/search mode
        clearSearch();

        setIsReviewingDifficult(true);
        setDifficultIndices(idxs);
        setDifficultPtr(0);
        setShowCompletionPrompt(false);

        // Jump to first difficult card
        setCurrentCardIndex(idxs[0]);

        // Ensure front side for a clean restart
        if (isFlipped) handleFlip();
    };

    const goToResults = async (sessionId) => {
        navigate(`/flashcards/study/${deckId}/results`, {
            state: { sessionId, from: location.state?.from }
        });
    };

    // Handle rating and navigation
    const onRatingClick = async (rating) => {
        // Still Learning-only difficulty tracking: "Know" does NOT qualify
        if (rating === 'still learning') {
            markDifficult(currentCard?.id);
        } else {
            unmarkDifficult(currentCard?.id);
        }

        // If we're reviewing difficult cards, update the rating and move through the set
        if (isReviewingDifficult) {
            await handleRating(rating);

            const nextPtr = difficultPtr + 1;


            // Flip back to front between cards
            if (isFlipped) handleFlip();

            if (nextPtr >= difficultIndices.length) {
                // Finished difficult pass
                setIsReviewingDifficult(false);
                setDifficultIndices([]);
                setDifficultPtr(0);
                setShowCompletionPrompt(true);
                return;
            }

            setDifficultPtr(nextPtr);
            setCurrentCardIndex(difficultIndices[nextPtr]);
            return;
        }


        // Normal flow uses the study session hook
        const result = await handleRating(rating);

        if (result?.completed) {
            // Offer Review Again if there are "still learning" cards
            if (difficultCardIds.size > 0 || rating === 'still learning') {
                setShowCompletionPrompt(true);
            } else {
                goToResults(result.sessionId);
            }
        }
    };

    const handleNextClick = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1)
        }
    }

    const handlePrevClick = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1)
        }
    }
    // Loading state
    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <ClipLoader color="var(--primary-400)" size={50} />
                    <p className="text-lg text-secondary">Loading study session...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="dashboard-content">
                <div className="max-w-md mx-auto mt-20">
                    <div className="card border-2 border-error text-center space-y-4">
                        <h2 className="text-2xl font-bold text-gradient-primary">Error Loading Study Session</h2>
                        <p className="text-secondary">{error}</p>
                        <button
                            onClick={() => navigate(location.state?.from || '/dashboard')}
                            className="btn btn-primary"
                        >
                            Back to Decks
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!deck || !session || !currentCard) {
        return (
            <div className="dashboard-content ">
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="card text-center space-y-4">
                        <h2 className="text-2xl font-bold text-gradient-primary">Study Session Not Found</h2>
                        <button
                            onClick={() => navigate(location.state?.from || '/dashboard')}
                            className="btn btn-primary"
                        >
                            Back to Decks
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Completion prompt: offer Review Again if "still learning" cards exist
    if (showCompletionPrompt) {
        return (
            <div className="dashboard-content">
                <div className="max-w-2xl mx-auto mt-16">
                    <div className="card text-center space-y-6">
                        <h2 className="text-3xl font-bold text-gradient-primary">Session Complete 🎉</h2>
                        <p className="text-secondary">
                            {difficultCount > 0
                                ? `You marked ${difficultCount} card${difficultCount === 1 ? '' : 's'} as still learning.`
                                : 'No difficult cards were marked.'}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {difficultCount > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={startDifficultReview}
                                >
                                    Review Again
                                </button>
                            )}

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate(location.state?.from || '/dashboard')}
                            >
                                Back to Decks
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => goToResults(session?.id)}
                            >
                                View Results
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gradient-primary">{deck.title}</h1>
                    <div className="flex items-center gap-3">
                        <button
                            className="px-4 py-2 bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all duration-200"
                            onClick={() => navigate(location.state?.from || '/dashboard')}
                            aria-label="Back to Decks"
                        >
                            Back to Decks
                        </button>
                        <button
                            className="px-4 py-2 bg-yellow-400 text-black rounded-lg border border-yellow-500 hover:bg-yellow-500 hover:text-white transition-all duration-200"
                            onClick={async () => {
                                try {
                                    if (!session?.id) {
                                        alert('No active session to save.');
                                        return;
                                    }
                                    await updateSessionProgress(session.id, currentCardIndex);
                                    alert('Progress saved. You can resume this deck later from Home.');
                                } catch (err) {
                                    console.error('Error saving progress:', err);
                                    alert('Failed to save progress. Please try again.');
                                }
                            }}
                            aria-label="Save progress for later"
                        >
                            Save for later
                        </button>
                    </div>
                </div>

                {/* Search Bar with Preview Mode Indicator */}
                <StudySearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onClearSearch={clearSearch}
                    filteredResults={filteredResults}
                    onJumpToCard={handleJumpToCard}
                    previewMode={previewMode}
                    studyPosition={studyPosition}
                    onReturnToStudy={handleReturnToStudy}
                />

                {/* Progress Bar */}
                <StudyProgressBar
                    currentIndex={isReviewingDifficult ? difficultPtr : currentCardIndex}
                    total={isReviewingDifficult ? (difficultIndices.length || 0) : (cards.length || 0)}
                />

                {/* Toggle for tracking progress*/}
                <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm">Track Progress</span>
                    <div
                        onClick={() => setToggleState(!toggleState)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${toggleState ? 'bg-[var(--primary-400)]' : 'bg-gray-300'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${toggleState ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </div>
                </label>
                {/* FLASHCARD */}
                <div className="space-y-6">
                    <StudyCard
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                    />

                    {/* Only show rating buttons when NOT in preview mode & when toggle for tracking is set to OFF */}
                    <div ref={buttonsRef}>
                        {!previewMode && (
                            toggleState ? (
                                <RatingButtons onRate={onRatingClick} />
                            ) :(
                                <NavButtons onPrevClick={handlePrevClick} onNextClick={handleNextClick} disablePrev={currentCardIndex === 0} disableNext={currentCardIndex === cards.length - 1} />
                            )
                        )}

                    </div>
                    {/* Show message when in preview mode and card is flipped */}
                    {isFlipped && previewMode && (
                        <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
                            <p className="text-secondary">Rating disabled in preview mode</p>
                        </div>
                    )}
                </div>

                {/* Only show if tracking progress is toggled to ON*/}
                {toggleState && (

                    <StudyStats stats={stats} />

                )}

            </div>
        </div>
    );
};

export default StudyMode;