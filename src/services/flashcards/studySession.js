import { db, timestamp } from "../firebase/firebaseService";
import { collection, doc, addDoc, updateDoc, getDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export const createStudySession = async (userId, deckId) => {
    const sessionData = {
        userId,
        deckId,
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        completedAt: null,
        currentCardIndex: 0,
        cardsStudied: 0,
        cardRatings: [],
        isCompleted: false,
        stats: {
            timeSpent: 0,
            easyCount: 0,
            goodCount: 0,
            hardCount: 0,
            successRate: 0
        }
    };

    const docRef = await addDoc(collection(db, "study_sessions"), sessionData);
    return { id: docRef.id, ...sessionData };
}

export const getActiveSession = async (userId, deckId) => {
    const q = query(
        collection(db, "study_sessions"),
        where("userId", "==", userId),
        where("deckId", "==", deckId),
        where("isCompleted", "==", false),
        orderBy("startedAt", "desc"),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const sessionDoc = snapshot.docs[0];
    return { id: sessionDoc.id, ...sessionDoc.data() };
}

export const recordCardRating = async (sessionId, cardId, rating) => {
    // Validate parameters
    if (!sessionId || sessionId === undefined) {
        throw new Error(`Invalid sessionId: ${sessionId}`);
    }
    if (!cardId || cardId === undefined) {
        throw new Error(`Invalid cardId: ${cardId}`);
    }
    if (!rating || !['easy', 'good', 'hard'].includes(rating)) {
        throw new Error(`Invalid rating: ${rating}`);
    }

    const sessionRef = doc(db, "study_sessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) throw new Error("Session not found");

    const sessionData = sessionDoc.data();
    const newRating = {
        cardId,
        rating, 
        timestamp: new Date().toISOString()
    }

    const updatedRatings = [...sessionData.cardRatings, newRating];
    const stats = calculateStats(updatedRatings);

    // Optimistic update - return immediately, save in background
    const updatedSession = { ...sessionData, cardRatings: updatedRatings, stats };
    
    // Non-blocking Firestore update
    updateDoc(sessionRef, {
        cardRatings: updatedRatings,
        cardsStudied: updatedRatings.length,
        lastActivityAt: new Date().toISOString(),
        'stats.easyCount': stats.easyCount,
        'stats.goodCount': stats.goodCount,
        'stats.hardCount': stats.hardCount,
        'stats.successRate': stats.successRate,
    }).catch(err => console.error('Error saving card rating:', err));

    return updatedSession;
}

export const updateSessionProgress = async (sessionId, currentCardIndex) => {
    const sessionRef = doc(db, "study_sessions", sessionId);
    await updateDoc(sessionRef, {
        currentCardIndex,
        lastActivityAt: new Date().toISOString()
    });
};

export const completeStudySession = async (sessionId, timeSpent, cardRatings = [], stats = {}) => {
    const sessionRef = doc(db, "study_sessions", sessionId);
    await updateDoc(sessionRef, {
        completedAt: new Date().toISOString(),
        isCompleted: true,
        cardRatings,
        cardsStudied: cardRatings.length,
        'stats.timeSpent': timeSpent,
        'stats.easyCount': stats.easyCount || 0,
        'stats.goodCount': stats.goodCount || 0,
        'stats.hardCount': stats.hardCount || 0,
        'stats.successRate': stats.successRate || 0,
        lastActivityAt: new Date().toISOString()
    });
};

// Helper function to calculate statistics
const calculateStats = (cardRatings) => {
    const easyCount = cardRatings.filter(r => r.rating === 'easy').length;
    const goodCount = cardRatings.filter(r => r.rating === 'good').length;
    const hardCount = cardRatings.filter(r => r.rating === 'hard').length;
    const total = cardRatings.length;
    const successRate = total > 0 ? ((easyCount + goodCount) / total) * 100 : 0;
    
    return { easyCount, goodCount, hardCount, successRate };
};

export const getRecentSessions = async (userId, limitCount = 6) => {
    if (!userId) return [];

    const q = query(
        collection(db, "study_sessions"),
        where("userId", "==", userId),
        orderBy("lastActivityAt", "desc"),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}