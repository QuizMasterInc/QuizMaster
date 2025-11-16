import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../../contexts/AuthContext';
import { useStudySession } from '../../../hooks/useStudySession';
import StudyCard from './StudyCard';
import StudyProgressBar from './StudyProgressBar';
import RatingButtons from './RatingButtons';
import StudyStats from './StudyStats';

/**
 * StudyMode - Main study session container
 * Responsible for: Orchestrating study flow and navigation
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
        isFlipped,
        loading,
        error,
        cards,
        handleFlip,
        handleRating
    } = useStudySession(deckId, currentUser?.uid);

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

    // Missing data state
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
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gradient-primary">{deck.title}</h1>
                    <button 
                        className="px-4 py-2 bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all duration-200"
                        onClick={() => navigate('/flashcards')}
                        aria-label="Exit study mode"
                    >
                        ✕ Exit
                    </button>
                </div>

                <StudyProgressBar 
                    currentIndex={currentCardIndex} 
                    total={cards.length} 
                />

                <div className="space-y-6">
                    <StudyCard 
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                    />

                    {isFlipped && (
                        <RatingButtons onRate={onRatingClick} />
                    )}
                </div>

                <StudyStats stats={session.stats} />
            </div>
        </div>
    );
};

export default StudyMode;
