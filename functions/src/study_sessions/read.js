const {onRequest} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

/**
 * Get a study session by ID
 * GET /study_sessions/get?sessionId=xxx
 */
exports.getStudySession = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'GET') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed. Use GET.'
            });
        }

        const sessionId = req.query.sessionId;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: sessionId'
            });
        }

        try {
            const db = admin.firestore();
            const sessionDoc = await db.collection('study_sessions').doc(sessionId).get();

            if (!sessionDoc.exists) {
                return res.status(404).json({
                    success: false,
                    message: 'Study session not found'
                });
            }

            return res.status(200).json({
                success: true,
                sessionId: sessionDoc.id,
                session: sessionDoc.data()
            });

        } catch (error) {
            console.error('Error getting study session:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
});

/**
 * Get active study session for a user and deck
 * GET /study_sessions/active?userId=xxx&deckId=xxx
 */
exports.getActiveSession = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'GET') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed. Use GET.'
            });
        }

        const {userId, deckId} = req.query;

        if (!userId || !deckId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: userId and deckId'
            });
        }

        try {
            const db = admin.firestore();
            const activeSessionQuery = await db.collection('study_sessions')
                .where('userId', '==', userId)
                .where('deckId', '==', deckId)
                .where('isCompleted', '==', false)
                .orderBy('startedAt', 'desc')
                .limit(1)
                .get();

            if (activeSessionQuery.empty) {
                return res.status(404).json({
                    success: false,
                    message: 'No active session found'
                });
            }

            const sessionDoc = activeSessionQuery.docs[0];
            return res.status(200).json({
                success: true,
                sessionId: sessionDoc.id,
                session: sessionDoc.data()
            });

        } catch (error) {
            console.error('Error getting active session:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
});

/**
 * Get user's study history
 * GET /study_sessions/history?userId=xxx&limit=10
 */
exports.getStudyHistory = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'GET') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed. Use GET.'
            });
        }

        const userId = req.query.userId;
        const limit = parseInt(req.query.limit) || 10;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: userId'
            });
        }

        try {
            const db = admin.firestore();
            const historyQuery = await db.collection('study_sessions')
                .where('userId', '==', userId)
                .where('isCompleted', '==', true)
                .orderBy('completedAt', 'desc')
                .limit(limit)
                .get();

            const sessions = historyQuery.docs.map(doc => ({
                sessionId: doc.id,
                ...doc.data()
            }));

            return res.status(200).json({
                success: true,
                count: sessions.length,
                sessions
            });

        } catch (error) {
            console.error('Error getting study history:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
});
