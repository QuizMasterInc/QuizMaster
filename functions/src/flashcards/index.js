const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

/**
 * Create a new flashcard deck
 */
exports.addCustomFlashcardDeck = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type');
        if (dataType === 'application/json') {
            const data = JSON.parse(JSON.stringify(req.body));

            // Extract data from flattened request
            const creatorID = data.creatorId;
            const title = data.title;
            const cards = data.cards || [];
            const tags = data.tags || "";

            // Validation
            if (!creatorID || !title.trim() || !Array.isArray(cards) || cards.length === 0) {
                return res.json({
                    status: 400,
                    success: false,
                    message: "Missing required parameters: creatorID, title, and cards array"
                });
            }

            try {
                const user = await admin.firestore().collection('users').doc(creatorID);
                const userDoc = await user.get();

                // Get creator information
                let creatorInfo = {
                    uid: creatorID,
                    displayName: 'Anonymous User',
                    username: 'Anonymous User'
                };

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    creatorInfo = {
                        uid: creatorID,
                        displayName: userData.profile?.displayName || userData.displayName ||
                                   `${userData.profile?.firstName || 'Anonymous'} ${userData.profile?.lastName || 'User'}`.trim(),
                        username: userData.profile?.displayName || userData.displayName || 'Anonymous User'
                    };
                }

                const currentDate = new Date().toISOString();

                // Convert cards array to array format (flattened schema)
                const cardsArray = cards.map((card, index) => ({
                    id: `card_${index + 1}`,
                    front: card.front || '',
                    back: card.back || '',
                    type: card.type || 'basic'
                }));

                // Use the flattened schema structure from frontend
                const newFlashcardDeck = {
                    // Basic metadata (use incoming data directly)
                    title: title,
                    description: data.description || "",
                    category: data.category || "General",
                    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
                    difficulty: data.difficulty || "medium",
                    isPublic: data.isPublic || false,
                    allowCopying: data.allowCopying ?? true,

                    // Creator information
                    creatorId: creatorInfo.uid,
                    creatorName: creatorInfo.displayName,

                    // Deck structure
                    cardCount: cards.length,
                    cards: cardsArray,

                    // Study analytics (use incoming or defaults)
                    analytics: data.analytics || {
                        stats: {
                            averageScore: 0,
                            timesStudied: 0,
                            lastStudied: null,
                            totalReviews: 0
                        }
                    },

                    // Timestamps
                    createdAt: currentDate,
                    updatedAt: currentDate,
                    lastStudiedAt: null,

                    // Status
                    isActive: true
                };

                // Save to Firestore
                const result = await admin.firestore().collection('flashcard_decks').add(newFlashcardDeck);

                // Update user stats and cache (similar to quiz creation)
                try {
                    if (userDoc.exists) {
                        await user.update({
                            'stats.flashcardDecksCreated': admin.firestore.FieldValue.increment(1),
                            'recentActivity.flashcardIds': admin.firestore.FieldValue.arrayUnion(result.id),
                            'timestamps.updatedAt': currentDate,
                            'timestamps.lastActiveAt': currentDate
                        });
                    }
                } catch (error) {
                    // Error updating user stats - silent fail
                    console.error('Error updating user stats for flashcard deck:', error);
                }

                return res.json({
                    status: 200,
                    success: true,
                    message: "Flashcard deck created successfully",
                    deckID: result.id,
                    data: newFlashcardDeck
                });

            } catch (error) {
                console.error('Error creating flashcard deck:', error);
                return res.json({
                    status: 500,
                    success: false,
                    message: error.message
                });
            }
        } else {
            return res.json({
                status: 400,
                success: false,
                message: "Content-Type must be application/json"
            });
        }
    });
});

/**
 * Get flashcard decks by user
 */
exports.getUserFlashcardDecks = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const userId = req.query.userId || req.body?.userId;

        if (!userId) {
            return res.json({
                status: 400,
                success: false,
                message: "User ID is required"
            });
        }

        try {
            const query = admin.firestore()
                .collection('flashcard_decks')
                .where('creatorId', '==', userId)
                .where('isActive', '==', true)
                .orderBy('updatedAt', 'desc');

            const querySnapshot = await query.get();
            const decks = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();
                decks.push({
                    id: doc.id,
                    ...data
                });
            });

            return res.json({
                status: 200,
                success: true,
                message: "Flashcard decks retrieved successfully",
                data: decks,
                count: decks.length
            });

        } catch (error) {
            console.error('Error fetching user flashcard decks:', error);
            return res.json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    });
});

/**
 * Get a specific flashcard deck by ID
 */
exports.getFlashcardDeck = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const deckId = req.query.deckId || req.body?.deckId;

        if (!deckId) {
            return res.json({
                status: 400,
                success: false,
                message: "Deck ID is required"
            });
        }

        try {
            const deckDoc = await admin.firestore().collection('flashcard_decks').doc(deckId).get();

            if (!deckDoc.exists) {
                return res.json({
                    status: 404,
                    success: false,
                    message: "Flashcard deck not found"
                });
            }

            const deckData = deckDoc.data();

            return res.json({
                status: 200,
                success: true,
                message: "Flashcard deck retrieved successfully",
                data: {
                    id: deckDoc.id,
                    ...deckData
                }
            });

        } catch (error) {
            console.error('Error fetching flashcard deck:', error);
            return res.json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    });
});

/**
 * Delete a flashcard deck
 */
exports.deleteFlashcardDeck = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const deckId = req.query.deckId || req.body?.deckId;
        const userId = req.query.userId || req.body?.userId;

        if (!deckId || !userId) {
            return res.json({
                status: 400,
                success: false,
                message: "Deck ID and User ID are required"
            });
        }

        try {
            const deckDoc = await admin.firestore().collection('flashcard_decks').doc(deckId).get();

            if (!deckDoc.exists) {
                return res.json({
                    status: 404,
                    success: false,
                    message: "Flashcard deck not found"
                });
            }

            const deckData = deckDoc.data();

            // Verify ownership (using flattened schema)
            if (deckData.creatorId !== userId) {
                return res.json({
                    status: 403,
                    success: false,
                    message: "Unauthorized: You can only delete your own decks"
                });
            }

            // Soft delete by setting isActive to false
            await admin.firestore().collection('flashcard_decks').doc(deckId).update({
                'isActive': false,
                'updatedAt': new Date().toISOString()
            });

            // Update user stats: decrement deck count and remove from recent cache
            try {
                const user = admin.firestore().collection('users').doc(userId);
                await user.update({
                    'stats.flashcardDecksCreated': admin.firestore.FieldValue.increment(-1),
                    'recentActivity.flashcardIds': admin.firestore.FieldValue.arrayRemove(deckId),
                    'timestamps.updatedAt': new Date().toISOString()
                });
            } catch (error) {
                // Error updating user stats - silent fail
                console.error('Error updating user stats for flashcard deck deletion:', error);
            }

            return res.json({
                status: 200,
                success: true,
                message: "Flashcard deck deleted successfully"
            });

        } catch (error) {
            console.error('Error deleting flashcard deck:', error);
            return res.json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    });
});