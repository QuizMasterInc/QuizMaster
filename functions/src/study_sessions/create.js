const {onRequest} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

/**
 * Create a new study session
 * POST /study_sessions/create
 * Body: { userId, deckId }
 */
exports.createStudySession = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed. Use POST.'
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
        const {userId, deckId} = data;

        // Validation
        if (!userId || !deckId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: userId and deckId'
            });
        }

        try {
            const db = admin.firestore();

            // Verify deck exists and get card count
            const deckRef = db.collection('flashcard_decks').doc(deckId);
            const deckDoc = await deckRef.get();

            if (!deckDoc.exists) {
                return res.status(404).json({
                    success: false,
                    message: 'Flashcard deck not found'
                });
            }

            const deckData = deckDoc.data();
            const totalCards = deckData.cards?.length || 0;

            if (totalCards === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot start study session: deck has no cards'
                });
            }

            // Check for existing active session
            const activeSessionQuery = await db.collection('study_sessions')
                .where('userId', '==', userId)
                .where('deckId', '==', deckId)
                .where('isCompleted', '==', false)
                .limit(1)
                .get();

            if (!activeSessionQuery.empty) {
                // Return existing active session
                const existingSession = activeSessionQuery.docs[0];
                return res.status(200).json({
                    success: true,
                    message: 'Active session already exists',
                    sessionId: existingSession.id,
                    session: existingSession.data()
                });
            }

            // Create new session
            const currentDate = new Date().toISOString();
            const newSession = {
                userId,
                deckId,
                startedAt: currentDate,
                completedAt: null,
                isCompleted: false,
                totalCards,
                currentCardIndex: 0,
                cardRatings: {},
                progress: {
                    easyCount: 0,
                    goodCount: 0,
                    hardCount: 0,
                    percentComplete: 0
                }
            };

            const sessionRef = await db.collection('study_sessions').add(newSession);

            return res.status(201).json({
                success: true,
                message: 'Study session created successfully',
                sessionId: sessionRef.id,
                session: newSession
            });

        } catch (error) {
            console.error('Error creating study session:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });
});
