const {onRequest} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

/**
 * Complete a study session
 * PUT /study_sessions/complete
 * Body: { sessionId }
 */
exports.completeStudySession = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'PUT') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed. Use PUT.'
            });
        }

        const dataType = req.get('content-type');
        if (dataType !== 'application/json') {
            return res.status(400).json({
                success: false,
                message: 'Content-Type must be application/json'
            });
        }

        const data = JSON.parse(JSON.stringify(req.body));
        const {sessionId} = data;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: sessionId'
            });
        }

        try {
            const db = admin.firestore();
            const sessionRef = db.collection('study_sessions').doc(sessionId);
            const sessionDoc = await sessionRef.get();

            if (!sessionDoc.exists) {
                return res.status(404).json({
                    success: false,
                    message: 'Study session not found'
                });
            }

            const sessionData = sessionDoc.data();

            if (sessionData.isCompleted) {
                return res.status(400).json({
                    success: false,
                    message: 'Session already completed'
                });
            }

            // Verify all cards have been rated
            const cardRatings = sessionData.cardRatings || {};
            const ratedCount = Object.keys(cardRatings).length;

            if (ratedCount !== sessionData.totalCards) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot complete session: ${sessionData.totalCards - ratedCount} cards remaining`,
                    cardsRated: ratedCount,
                    totalCards: sessionData.totalCards
                });
            }

            const currentDate = new Date().toISOString();

            // Update session as completed
            await sessionRef.update({
                isCompleted: true,
                completedAt: currentDate
            });

            // Update deck analytics
            const deckRef = db.collection('flashcard_decks').doc(sessionData.deckId);
            const deckDoc = await deckRef.get();

            if (deckDoc.exists) {
                const currentTimesStudied = deckDoc.data().analytics?.stats?.timesStudied || 0;
                
                await deckRef.update({
                    'analytics.stats.timesStudied': currentTimesStudied + 1,
                    'analytics.stats.lastStudiedAt': currentDate
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Study session completed successfully',
                completedAt: currentDate
            });

        } catch (error) {
            console.error('Error completing study session:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
});

/**
 * Delete a study session
 * DELETE /study_sessions/delete?sessionId=xxx
 */
exports.deleteStudySession = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'DELETE') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed. Use DELETE.'
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
            const sessionRef = db.collection('study_sessions').doc(sessionId);
            const sessionDoc = await sessionRef.get();

            if (!sessionDoc.exists) {
                return res.status(404).json({
                    success: false,
                    message: 'Study session not found'
                });
            }

            await sessionRef.delete();

            return res.status(200).json({
                success: true,
                message: 'Study session deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting study session:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
});
