import { useParams, useNavigate } from 'react-router-dom';
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

/**
 * StudyMode - Main study session container
 * Orchestrates study flow with search/preview functionality
 */
const StudyMode = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

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
        cardsStudied,
        handleFlip,
        handleRating
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

    // Handle rating and navigation
    const onRatingClick = async (rating) => {
        const result = await handleRating(rating);
        
        if (result?.completed) {
            navigate(`/flashcards/study/${deckId}/results`, {
                state: { sessionId: result.sessionId }
            });
        }
    };

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
                            onClick={() => navigate('/flashcards')}
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
            <div className="dashboard-content">
                <div className="max-w-md mx-auto mt-20">
                    <div className="card text-center space-y-4">
                        <h2 className="text-2xl font-bold text-gradient-primary">Study Session Not Found</h2>
                        <button 
                            onClick={() => navigate('/flashcards')}
                            className="btn btn-primary"
                        >
                            Back to Decks
                        </button>
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
                            onClick={() => navigate('/flashcards')}
                            aria-label="Exit study mode"
                        >
                            ✕ Exit
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
                    currentIndex={currentCardIndex} 
                    total={cards.length} 
                />

                {/* FLASHCARD */}
                <div className="space-y-6">
                    <StudyCard 
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                    />

                    {/* Only show rating buttons when NOT in preview mode */}
                    {isFlipped && !previewMode && (
                        <RatingButtons onRate={onRatingClick} />
                    )}

                    {/* Show message when in preview mode and card is flipped */}
                    {isFlipped && previewMode && (
                        <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
                            <p className="text-secondary">Rating disabled in preview mode</p>
                        </div>
                    )}
                </div>

                <StudyStats stats={stats} />

            </div>
        </div>
    );
};

export default StudyMode;
