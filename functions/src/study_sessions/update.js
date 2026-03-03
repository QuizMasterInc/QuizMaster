const {onRequest} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

/**
 * Update study session progress (rate a card)
 * PUT /study_sessions/update
 * Body: { sessionId, cardIndex, rating }
 */
exports.updateStudySession = onRequest(async (req, res) => {
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
        const {sessionId, cardIndex, rating} = data;

        // Validation
        if (!sessionId || cardIndex === undefined || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: sessionId, cardIndex, and rating'
            });
        }

        const validRatings = ['know','still learning'];
        if (!validRatings.includes(rating)) {
            return res.status(400).json({
                success: false,
                message: `Invalid rating. Must be one of: ${validRatings.join(', ')}`
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
                    message: 'Cannot update completed session'
                });
            }

            // Update card rating
            const cardRatings = sessionData.cardRatings || {};
            cardRatings[cardIndex] = rating;

            // Update progress counts
            const ratedCards = Object.values(cardRatings);
            const progress = {
                knowCount: ratedCards.filter(r => r === 'know').length,
                stillLearningCount: ratedCards.filter(r => r === 'still learning').length,
                percentComplete: Math.round((ratedCards.length / sessionData.totalCards) * 100)
            };

            // Update current card index
            const currentCardIndex = cardIndex + 1;

            await sessionRef.update({
                cardRatings,
                progress,
                currentCardIndex
            });

            return res.status(200).json({
                success: true,
                message: 'Study session updated successfully',
                progress
            });

        } catch (error) {
            console.error('Error updating study session:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
});
