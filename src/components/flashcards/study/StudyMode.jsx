import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../../contexts/AuthContext';
import { useStudySession } from '../../../hooks/useStudySession';
import { useState, useMemo } from 'react';

import StudyCard from './StudyCard';
import StudyProgressBar from './StudyProgressBar';
import RatingButtons from './RatingButtons';
import StudyStats from './StudyStats';

/**
 * StudyMode - Main study session container
 * Now includes: Search bar for locating specific questions
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
        stats,
        cardsStudied,
        handleFlip,
        handleRating,
        setCurrentCardIndex // ← we NEED this to JUMP to a card
    } = useStudySession(deckId, currentUser?.uid);

    // -------------------------
    // 🔎 SEARCH FEATURE ADDED
    // -------------------------
    const [searchTerm, setSearchTerm] = useState("");

    // Filter cards based on search
    const filteredResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return cards
            .map((c, index) => ({ ...c, index }))
            .filter(c =>
                c.question?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [searchTerm, cards]);

    const handleJumpToCard = (index) => {
        setCurrentCardIndex(index);
        setSearchTerm("");
    };

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
                    <button 
                        className="px-4 py-2 bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all duration-200"
                        onClick={() => navigate('/flashcards')}
                        aria-label="Exit study mode"
                    >
                        ✕ Exit
                    </button>
                </div>

                {/* 🔎 SEARCH BAR */}
                <div className="relative max-w-xl mx-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for a question..."
                        className="w-full px-4 py-3 rounded-lg bg-input border border-accent text-primary focus:border-accent-hover transition-all"
                    />
                    
                    {/* Clear button */}
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white"
                        >
                            ✕
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {searchTerm && (
                        <div className="absolute w-full mt-2 bg-card border border-accent rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                            {filteredResults.length === 0 ? (
                                <div className="p-4 text-secondary text-center">
                                    No matching questions found.
                                </div>
                            ) : (
                                filteredResults.map(result => (
                                    <button
                                        key={result.index}
                                        onClick={() => handleJumpToCard(result.index)}
                                        className="block w-full text-left px-4 py-2 hover:bg-[var(--accent)] hover:text-white transition-all"
                                    >
                                        <span className="font-semibold text-primary">
                                            Question {result.index + 1}:
                                        </span>{' '}
                                        {result.question.length > 60
                                            ? result.question.slice(0, 60) + "..."
                                            : result.question}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* PROGRESS BAR */}
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

                    {isFlipped && (
                        <RatingButtons onRate={onRatingClick} />
                    )}
                </div>

                <StudyStats stats={stats} />

            </div>
        </div>
    );
};

export default StudyMode;
