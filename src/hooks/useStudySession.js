import { useState, useEffect, useCallback, useRef } from 'react';
import {
    createStudySession,
    getActiveSession,
    completeStudySession,
    updateLastActivity
} from '../services/flashcards/studySession';
import flashcardService from '../services/flashcards/flashcardService';
 
/**
 * useStudySession - Custom hook for managing study session state
 * 
 * Track Progress behavior:
 * - ON:  Ratings UI shown, stats visible, progress persisted to Firestore on every card change
 * - OFF: NavButtons shown, stats hidden, progress stops being persisted
 * - On mount: position and ratings are ALWAYS restored if they exist, regardless of toggle state
 * - Toggling off mid-session pauses persistence but keeps your place
 * - Toggling back on resumes persistence from wherever you are
 */
export const useStudySession = (deckId, userId) => {
    const [session, setSession] = useState(null);
    const [deck, setDeck] = useState(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startTime] = useState(Date.now());
    const [localRatings, setLocalRatings] = useState([]);
    const [trackProgress, setTrackProgress] = useState(false);
 
    // Ref to avoid stale closures in the persist effect
    const localRatingsRef = useRef(localRatings);
    localRatingsRef.current = localRatings;
 
    useEffect(() => {
        const initializeSession = async () => {
            try {
                setLoading(true);
                setError(null);
 
                const deckData = await flashcardService.getFlashcardDeck(deckId);
                setDeck(deckData);
 
                const activeSession = await getActiveSession(userId, deckId);
 
                if (activeSession) {
                    await updateLastActivity(activeSession.id);
                    setSession(activeSession);
 
                    // Restore toggle state
                    setTrackProgress(activeSession.trackProgress ?? false);
 
                    // Always restore position if it exists, regardless of toggle state
                    if (activeSession.lastCardIndex != null) {
                        setCurrentCardIndex(activeSession.lastCardIndex);
                    } else {
                        setCurrentCardIndex(0);
                    }
 
                    // Always restore ratings if they exist
                    if (Array.isArray(activeSession.cardRatings) && activeSession.cardRatings.length > 0) {
                        setLocalRatings(activeSession.cardRatings);
                    }
                } else {
                    const newSession = await createStudySession(userId, deckId, deckData.title);
                    setSession(newSession);
                    setCurrentCardIndex(0);
                    setTrackProgress(false);
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
 
    // Persist card index, ratings, and stats whenever the card changes — only if tracking is on
    useEffect(() => {
        if (!session?.id || !trackProgress) return;
 
        const ratings = localRatingsRef.current;
        const knowCount = ratings.filter(r => r.rating === 'know').length;
        const stillLearningCount = ratings.filter(r => r.rating === 'still learning').length;
        const successRate = ratings.length > 0
            ? (knowCount / ratings.length) * 100
            : 0;
 
        updateLastActivity(session.id, {
            lastCardIndex: currentCardIndex,
            trackProgress: true,
            cardRatings: ratings,
            cardsStudied: ratings.length,
            'stats.knowCount': knowCount,
            'stats.stillLearningCount': stillLearningCount,
            'stats.successRate': successRate
        }).catch((err) =>
            console.error('Error persisting session progress:', err)
        );
    }, [currentCardIndex, trackProgress, session?.id]);
 
    // Toggle track progress on/off and persist to session
    const setTrackProgressAndPersist = useCallback(
        async (enabled) => {
            setTrackProgress(enabled);
 
            if (!session?.id) return;
 
            try {
                if (enabled) {
                    const ratings = localRatingsRef.current;
                    const knowCount = ratings.filter(r => r.rating === 'know').length;
                    const stillLearningCount = ratings.filter(r => r.rating === 'still learning').length;
                    const successRate = ratings.length > 0
                        ? (knowCount / ratings.length) * 100
                        : 0;
 
                    // Resume tracking — save current position, ratings, and stats
                    await updateLastActivity(session.id, {
                        trackProgress: true,
                        lastCardIndex: currentCardIndex,
                        cardRatings: ratings,
                        cardsStudied: ratings.length,
                        'stats.knowCount': knowCount,
                        'stats.stillLearningCount': stillLearningCount,
                        'stats.successRate': successRate
                    });
                } else {
                    // Pause tracking — just flip the flag, keep all data intact
                    await updateLastActivity(session.id, {
                        trackProgress: false
                    });
                }
            } catch (err) {
                console.error('Error persisting track progress toggle:', err);
            }
        },
        [session?.id, currentCardIndex]
    );
 
    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };
 
    const handleRating = async (rating) => {
        if (!deck) return null;
 
        try {
            const currentCard = getCardsArray()[currentCardIndex];
            if (!currentCard) return null;
 
            const newRating = {
                cardId: currentCard.id || `card_${currentCardIndex}`,
                rating,
                timestamp: new Date().toISOString()
            };
 
            const existingIndex = localRatings.findIndex(r => r.cardId === newRating.cardId);
 
            let updatedRatings;
            if (existingIndex !== -1) {
                updatedRatings = [...localRatings];
                updatedRatings[existingIndex] = newRating;
            } else {
                updatedRatings = [...localRatings, newRating];
            }
 
            setLocalRatings(updatedRatings);
 
            const nextIndex = currentCardIndex + 1;
 
            if (nextIndex < deck.cardCount) {
                setCurrentCardIndex(nextIndex);
                setIsFlipped(false);
                return { completed: false, nextIndex };
            } else {
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
 
                const knowCount = updatedRatings.filter(r => r.rating === 'know').length;
                const stillLearningCount = updatedRatings.filter(r => r.rating === 'still learning').length;
                const successRate = updatedRatings.length > 0
                    ? (knowCount / updatedRatings.length) * 100
                    : 0;
 
                if (session?.id) {
                    await completeStudySession(session.id, timeSpent, updatedRatings, {
                        knowCount,
                        stillLearningCount,
                        successRate,
                        timeSpent
                    });
 
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
 
    const getCardsArray = () => {
        if (!deck || !deck.cards) return [];
 
        if (Array.isArray(deck.cards)) {
            return deck.cards.map((card, index) => ({
                id: card.id || `card_${index}`,
                ...card
            }));
        }
 
        return Object.entries(deck.cards).map(([key, card]) => ({
            id: card.id || key,
            ...card
        }));
    };
 
    const cards = getCardsArray();
    const currentCard = cards[currentCardIndex];
 
    const currentStats = {
        knowCount: localRatings.filter(r => r.rating === 'know').length,
        stillLearningCount: localRatings.filter(r => r.rating === 'still learning').length,
        successRate: localRatings.length > 0
            ? ((localRatings.filter(r => r.rating === 'know').length / localRatings.length) * 100)
            : 0
    };
 
    const saveSession = async () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
 
        if (session?.id) {
            await completeStudySession(session.id, timeSpent, localRatings, {
                knowCount: currentStats.knowCount,
                stillLearningCount: currentStats.stillLearningCount,
                successRate: currentStats.successRate,
                timeSpent
            });
        }
        return session?.id;
    };
 
    return {
        session,
        deck,
        currentCard,
        currentCardIndex,
        setCurrentCardIndex,
        isFlipped,
        loading,
        error,
        cards,
        stats: currentStats,
        cardsStudied: localRatings.length,
        localRatings,
        trackProgress,
        setTrackProgress: setTrackProgressAndPersist,
        handleFlip,
        handleRating,
        saveSession
    };
};
 