import { db } from "../firebase/firebaseService";
import { collection, doc, addDoc, updateDoc, getDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export const createStudySession = async (userId, deckId, deckTitle) => {
    const sessionData = {
        userId,
        deckId,
        deckTitle: deckTitle || 'Untitled Deck',
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        completedAt: null,
        currentCardIndex: 0,
        cardsStudied: 0,
        cardRatings: [],
        isCompleted: false,
        stats: {
            timeSpent: 0,
            knowCount: 0,
            stillLearningCount: 0,
            successRate: 0
        }
    };

    const docRef = await addDoc(collection(db, "study_sessions"), sessionData);
    return { id: docRef.id, ...sessionData };
};

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
};

export const recordCardRating = async (sessionId, cardId, rating) => {
    if (!sessionId) {
        throw new Error(`Invalid sessionId: ${sessionId}`);
    }
    if (!cardId) {
        throw new Error(`Invalid cardId: ${cardId}`);
    }
    if (!rating || !['still learning', 'know'].includes(rating)) {
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
    };

    const updatedRatings = [...sessionData.cardRatings, newRating];
    const stats = calculateStats(updatedRatings);

    const updatedSession = { ...sessionData, cardRatings: updatedRatings, stats };
    
    updateDoc(sessionRef, {
        cardRatings: updatedRatings,
        cardsStudied: updatedRatings.length,
        lastActivityAt: new Date().toISOString(),
        'stats.knowCount': stats.knowCount,
        'stats.stillLearningCount': stats.stillLearningCount,
        'stats.successRate': stats.successRate,
    }).catch(err => console.error('Error saving card rating:', err));

    return updatedSession;
};

export const completeStudySession = async (sessionId, timeSpent, cardRatings = [], stats = {}) => {
    const sessionRef = doc(db, "study_sessions", sessionId);
    await updateDoc(sessionRef, {
        completedAt: new Date().toISOString(),
        isCompleted: true,
        cardRatings,
        cardsStudied: cardRatings.length,
        'stats.timeSpent': timeSpent,
        'stats.knowCount': stats.knowCount || 0,
        'stats.stillLearningCount': stats.stillLearningCount || 0,
        'stats.successRate': stats.successRate || 0,
        lastActivityAt: new Date().toISOString()
    });
};

const calculateStats = (cardRatings) => {
    const knowCount = cardRatings.filter(r => r.rating === 'know').length;
    const stillLearningCount = cardRatings.filter(r => r.rating === 'still learning').length;
    const total = cardRatings.length;
    const successRate = total > 0 ? (knowCount / total) * 100 : 0;
    
    return { knowCount, stillLearningCount, successRate };
};

export const getRecentSessions = async (userId, limitCount = 6) => {
    if (!userId) return [];

    const primaryQ = query(
        collection(db, "study_sessions"),
        where("userId", "==", userId),
        orderBy("lastActivityAt", "desc"),
        limit(limitCount)
    );

    const snapshot = await getDocs(primaryQ);

    if (snapshot.empty) {
        const fallbackQ = query(
            collection(db, "study_sessions"),
            where("userId", "==", userId),
            orderBy("startedAt", "desc"),
            limit(limitCount)
        );

        const fallbackSnapshot = await getDocs(fallbackQ);
        if (fallbackSnapshot.empty) return [];
        
        const sessions = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return await addDeckTitles(sessions);
    }

    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return await addDeckTitles(sessions);
};

const addDeckTitles = async (sessions) => {
    const sessionsWithTitles = await Promise.all(
        sessions.map(async (session) => {
            if (session.deckTitle) return session;
 
            try {
                const deckRef = doc(db, "flashcard_decks", session.deckId);
                const deckSnap = await getDoc(deckRef);
                
                if (deckSnap.exists()) {
                    return { ...session, deckTitle: deckSnap.data().title };
                }
            } catch (err) {
                console.error('Error fetching deck title:', err);
            }
            
            return session;
        })
    );

    return sessionsWithTitles;
};