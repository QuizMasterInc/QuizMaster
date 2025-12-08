import { useState, useEffect } from 'react';
import {
    createStudySession,
    getActiveSession,
    recordCardRating,
    updateSessionProgress,
    completeStudySession
} from '../services/flashcards/studySession';
import flashcardService from '../services/flashcards/flashcardService';

/**
 * useStudySession - Custom hook for managing study session state
 * Responsible for: Session lifecycle and state management
 */
export const useStudySession = (deckId, userId) => {
    const [session, setSession] = useState(null);
    const [deck, setDeck] = useState(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startTime] = useState(Date.now());
    const [localRatings, setLocalRatings] = useState([]); // Store ratings in memory

    // Initialize session
    useEffect(() => {
        const initializeSession = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load deck
                const deckData = await flashcardService.getFlashcardDeck(deckId);
                setDeck(deckData);

                // Check for existing session
                const activeSession = await getActiveSession(userId, deckId);

                if (activeSession) {
                    // Resume existing session
                    setSession(activeSession);
                    setCurrentCardIndex(activeSession.currentCardIndex);
                } else {
                    // Create new session
                    const newSession = await createStudySession(userId, deckId);
                    setSession(newSession);
                    setCurrentCardIndex(0);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error initializing study session:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (deckId && userId) {
            initializeSession();
        }
    }, [deckId, userId]);

    // Handle card flip
    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // Handle card rating (all in memory - no database calls)
    const handleRating = async (rating) => {
        if (!deck) return null;

        try {
            const currentCard = getCardsArray()[currentCardIndex];
            if (!currentCard) return null;

            // Store rating in memory only
            const newRating = {
                cardId: currentCard.id || `card_${currentCardIndex}`,
                rating,
                timestamp: new Date().toISOString()
            };

            const updatedRatings = [...localRatings, newRating];
            setLocalRatings(updatedRatings);

            // Move to next card or complete session
            const nextIndex = currentCardIndex + 1;

            if (nextIndex < deck.cardCount) {
                // Just move to next card (instant - no DB calls)
                setCurrentCardIndex(nextIndex);
                setIsFlipped(false);
                return { completed: false, nextIndex };
            } else {
                // Last card - save everything to database now
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                
                // Calculate final stats
                const easyCount = updatedRatings.filter(r => r.rating === 'easy').length;
                const goodCount = updatedRatings.filter(r => r.rating === 'good').length;
                const hardCount = updatedRatings.filter(r => r.rating === 'hard').length;
                const successRate = updatedRatings.length > 0 
                    ? ((easyCount + goodCount) / updatedRatings.length) * 100 
                    : 0;

                // Save all ratings at once
                if (session?.id) {
                    await completeStudySession(session.id, timeSpent, updatedRatings, {
                        easyCount,
                        goodCount,
                        hardCount,
                        successRate,
                        timeSpent
                    });
                    
                    // Update analytics in background
                    flashcardService.updateDeckAnalytics(deckId).catch(err => 
                        console.error('Error updating deck analytics:', err)
                    );
                }

                return { completed: true, sessionId: session?.id };
            }
        } catch (err) {
            console.error('Error handling rating:', err);
            setError(err.message);
            return null;
        }
    };

    // Get cards as array (memoized to prevent recreating on every render)
    const getCardsArray = () => {
        if (!deck || !deck.cards) return [];
        
        // Handle both object and array formats
        if (Array.isArray(deck.cards)) {
            return deck.cards.map((card, index) => ({
                id: card.id || `card_${index}`,
                ...card
            }));
        }
        
        // Convert object to array with proper IDs
        return Object.entries(deck.cards).map(([key, card]) => ({
            id: card.id || key,
            ...card
        }));
    };

    const cards = getCardsArray();
    const currentCard = cards[currentCardIndex];

    // Calculate current stats from local ratings
    const currentStats = {
        easyCount: localRatings.filter(r => r.rating === 'easy').length,
        goodCount: localRatings.filter(r => r.rating === 'good').length,
        hardCount: localRatings.filter(r => r.rating === 'hard').length,
        successRate: localRatings.length > 0 
            ? ((localRatings.filter(r => r.rating === 'easy' || r.rating === 'good').length / localRatings.length) * 100)
            : 0
    };

    return {
        session,
        deck,
        currentCard,
        currentCardIndex,
        setCurrentCardIndex, // Expose for preview mode navigation
        isFlipped,
        loading,
        error,
        cards,
        stats: currentStats,
        cardsStudied: localRatings.length,
        handleFlip,
        handleRating
    };
};
