import { useState, useEffect, useCallback, useRef } from 'react';
import {
    createStudySession,
    getActiveSession,
    completeStudySession,
    updateLastActivity
} from '../services/flashcards/studySession';
import flashcardService from '../services/flashcards/flashcardService';
import { shuffle } from '../utils/shuffle';

/**
 * useStudySession - Custom hook for managing study session state
 *
 * Track Progress behavior:
 * - ON:  Ratings UI shown, stats visible, progress persisted to Firestore on every card change
 * - OFF: NavButtons shown, stats hidden, progress stops being persisted
 * - On mount: position and ratings are ALWAYS restored if they exist, regardless of toggle state
 * - Toggling off mid-session pauses persistence but keeps your place
 * - Toggling back on resumes persistence from wherever you are
 *
 * Shuffle behavior:
 * - The study order is driven by `cardOrder` (an array of card IDs).
 * - On a fresh session, cardOrder = the deck's natural order.
 * - shuffleCards() pins the current card at its current index and shuffles the rest.
 * - cardOrder is always persisted to Firestore, so leaving and coming back
 *   resumes the same shuffled order.
 * - If the deck was edited (cards added/removed) since the order was saved,
 *   we fall back to the natural order to avoid stale references.
 *
 * Rating navigation:
 * - After rating a card, advances to the next UNRATED card (not just index+1).
 * - This guarantees shuffle can't strand cards behind the current index.
 * - Session only completes when every unique card has a rating.
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
    const [cardOrder, setCardOrder] = useState([]); // array of card IDs

    // Refs to avoid stale closures in effects/callbacks
    const localRatingsRef = useRef(localRatings);
    localRatingsRef.current = localRatings;

    const cardOrderRef = useRef(cardOrder);
    cardOrderRef.current = cardOrder;

    // Build the natural-order list of card IDs from a deck object.
    // Mirrors the id-assignment logic used in getCardsArray().
    const buildDefaultOrder = (deckData) => {
        if (!deckData || !deckData.cards) return [];

        if (Array.isArray(deckData.cards)) {
            return deckData.cards.map((card, index) => card.id || `card_${index}`);
        }

        return Object.entries(deckData.cards).map(([key, card]) => card.id || key);
    };

    useEffect(() => {
        const initializeSession = async () => {
            try {
                setLoading(true);
                setError(null);

                const deckData = await flashcardService.getFlashcardDeck(deckId);
                setDeck(deckData);

                const defaultOrder = buildDefaultOrder(deckData);

                const activeSession = await getActiveSession(userId, deckId);

                if (activeSession) {
                    await updateLastActivity(activeSession.id);
                    setSession(activeSession);

                    // Restore toggle state
                    setTrackProgress(activeSession.trackProgress ?? false);

                    // Restore cardOrder if it's saved AND still valid (same set of IDs).
                    // If the deck was edited since the session started, fall back.
                    const savedOrder = Array.isArray(activeSession.cardOrder)
                        ? activeSession.cardOrder
                        : null;

                    const isValidSavedOrder =
                        savedOrder &&
                        savedOrder.length > 0 &&
                        savedOrder.length === defaultOrder.length &&
                        savedOrder.every((id) => defaultOrder.includes(id));

                    setCardOrder(isValidSavedOrder ? savedOrder : defaultOrder);

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
                    setCardOrder(defaultOrder);
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

    // Persist card index, ratings, stats, and order whenever the card changes — only if tracking is on
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
            cardOrder: cardOrderRef.current,
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

                    // Resume tracking — save current position, ratings, order, and stats
                    await updateLastActivity(session.id, {
                        trackProgress: true,
                        lastCardIndex: currentCardIndex,
                        cardRatings: ratings,
                        cardsStudied: ratings.length,
                        cardOrder: cardOrderRef.current,
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

    /**
     * Shuffle the remaining cards. Pins the currently displayed card at its
     * current index so the user isn't yanked to a different card mid-session.
     * Persists the new order to Firestore immediately.
     */
    const shuffleCards = useCallback(async () => {
        const order = cardOrderRef.current;
        if (!order || order.length <= 1) return;

        const pinnedId = order[currentCardIndex];
        const rest = order.filter((_, i) => i !== currentCardIndex);
        const shuffledRest = shuffle(rest);

        // Reinsert the pinned card at its original position so currentCardIndex
        // still points at the same card the user is looking at.
        const newOrder = [...shuffledRest];
        newOrder.splice(currentCardIndex, 0, pinnedId);

        setCardOrder(newOrder);

        // Always persist the shuffled order, even if trackProgress is off,
        // because the user explicitly chose this order.
        if (session?.id) {
            try {
                await updateLastActivity(session.id, { cardOrder: newOrder });
            } catch (err) {
                console.error('Error persisting shuffled order:', err);
            }
        }
    }, [currentCardIndex, session?.id]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleRating = async (rating) => {
        if (!deck) return null;

        try {
            const cardsArr = getCardsArray();
            const currentCard = cardsArr[currentCardIndex];
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

            // Find the next UNRATED card after the current position.
            // This handles the shuffle-skip case: if shuffle moved an unrated
            // card behind the current index, we still visit it before completing.
            const ratedIds = new Set(updatedRatings.map(r => r.cardId));

            // Search forward from the next index first
            let nextIndex = -1;
            for (let i = currentCardIndex + 1; i < cardsArr.length; i++) {
                if (!ratedIds.has(cardsArr[i].id)) {
                    nextIndex = i;
                    break;
                }
            }

            // If nothing forward, wrap around to catch cards shuffled behind us
            if (nextIndex === -1) {
                for (let i = 0; i < currentCardIndex; i++) {
                    if (!ratedIds.has(cardsArr[i].id)) {
                        nextIndex = i;
                        break;
                    }
                }
            }

            if (nextIndex !== -1) {
                setCurrentCardIndex(nextIndex);
                setIsFlipped(false);
                return { completed: false, nextIndex };
            } else {
                // Every card has been rated — complete the session
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

    /**
     * Returns the cards in study order (driven by cardOrder).
     * Builds an id->card map from the deck once, then maps cardOrder over it.
     * Falls back to the deck's natural order if cardOrder is empty
     * (e.g. on first render before init completes).
     */
    const getCardsArray = () => {
        if (!deck || !deck.cards) return [];

        // Normalize deck.cards into an array with stable ids
        let normalized;
        if (Array.isArray(deck.cards)) {
            normalized = deck.cards.map((card, index) => ({
                id: card.id || `card_${index}`,
                ...card
            }));
        } else {
            normalized = Object.entries(deck.cards).map(([key, card]) => ({
                id: card.id || key,
                ...card
            }));
        }

        // No order yet — return natural order
        if (!cardOrder || cardOrder.length === 0) return normalized;

        // Map cardOrder over the normalized deck
        const byId = new Map(normalized.map(c => [c.id, c]));
        const ordered = cardOrder
            .map(id => byId.get(id))
            .filter(Boolean); // drop any stale ids defensively

        // If something went wrong (e.g. all ids stale), fall back
        return ordered.length > 0 ? ordered : normalized;
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
        saveSession,
        shuffleCards
    };
};