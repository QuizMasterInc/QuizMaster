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

    // Handle card rating
    const handleRating = async (rating) => {
        if (!session || !deck) return null;

        try {
            const currentCard = getCardsArray()[currentCardIndex];

            // Record rating
            const updatedSession = await recordCardRating(
                session.id,
                currentCard.id,
                rating
            );
            setSession(updatedSession);

            // Move to next card or complete session
            const nextIndex = currentCardIndex + 1;

            if (nextIndex < deck.cardCount) {
                await updateSessionProgress(session.id, nextIndex);
                setCurrentCardIndex(nextIndex);
                setIsFlipped(false);
                return { completed: false, nextIndex };
            } else {
                // Complete session
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                await completeStudySession(session.id, timeSpent);
                await flashcardService.updateDeckAnalytics(deckId);
                return { completed: true, sessionId: session.id };
            }
        } catch (err) {
            console.error('Error handling rating:', err);
            setError(err.message);
            return null;
        }
    };

    // Get cards as array
    const getCardsArray = () => {
        if (!deck || !deck.cards) return [];
        
        // Handle both object and array formats
        if (Array.isArray(deck.cards)) {
            return deck.cards;
        }
        
        return Object.entries(deck.cards).map(([key, card]) => ({
            id: card.id || key,
            ...card
        }));
    };

    const cards = getCardsArray();
    const currentCard = cards[currentCardIndex];

    return {
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
    };
};
