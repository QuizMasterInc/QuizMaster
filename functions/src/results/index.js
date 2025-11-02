const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

/**
 * Get ALL quiz results for a user in a single call
 */
exports.grabAllResultsV2 = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if (dataType === 'application/json') {
            const data = JSON.parse(JSON.stringify(req.body))
            const { uid } = data

            if (!uid) {
                return res.status(400).json({ error: 'Missing uid parameter' })
            }

            try {
                // Get user document with categoryStats
                const userDoc = await admin.firestore().collection('users').doc(uid).get();

                if (!userDoc.exists) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const userData = userDoc.data();
                const categoryStats = userData.stats?.categoryStats || {};

                // Map the actual categories from our constants
                const categories = ['geography', 'science', 'sports', 'mathematics', 'history', 'entertainment'];
                const allResults = {};

                categories.forEach(category => {
                    const categoryKey = category.toLowerCase();
                    const stats = categoryStats[categoryKey] || {
                        best: 0,
                        avg: 0,
                        attempts: 0,
                        totalScore: 0
                    };

                    // Convert to the format expected by frontend (score = best, avgScore = avg)
                    allResults[category] = {
                        score: (stats.best || 0) / 100, // Convert percentage to decimal
                        avgScore: (stats.avg || 0) / 100, // Convert percentage to decimal
                        attempts: stats.attempts || 0
                    };
                });

                res.set('Cache-Control', 'public, max-age=300') // 5 minute cache
                res.json(allResults)

            } catch (error) {
                console.error('Error fetching all results V2:', error)
                res.status(500).json({ error: 'Error fetching quiz results' })
            }
        } else {
            res.status(400).json({ error: 'Invalid content type. Expected application/json' })
        }
    })
})

/**
 * Submit quiz results and update user category statistics
 * Handles both quiz_results collection storage and user stats updates
 */
exports.submitQuizResults = onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const {
                userId,
                category,
                score,
                totalQuestions,
                timeSpent,
                difficulty = "3",
                sessionId,
                quizType = "default",
                quizId = null,
                amount = null,
                questionIds = [],
                userAnswers = {}
            } = req.body;

            // Validate required fields
            if (!userId || !category || score === undefined || !totalQuestions) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: userId, category, score, totalQuestions'
                });
            }

            // Validate category for default quizzes only
            const validCategories = ['geography', 'science', 'sports', 'mathematics', 'history', 'entertainment'];
            const isDefaultQuiz = quizType === "default";

            if (isDefaultQuiz && !validCategories.includes(category.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid category for default quiz. Must be one of: ${validCategories.join(', ')}`
                });
            }

            // For default quizzes, generate quizId if not provided
            let finalQuizId = quizId;
            if (isDefaultQuiz && !finalQuizId) {
                finalQuizId = `${category.toLowerCase()}_${difficulty}_${amount || totalQuestions}`;
            }

            // Calculate percentage
            const percentage = Math.round((score / totalQuestions) * 100);

            // Create quiz result document with unified schema
            const quizResult = {
                userId,
                category: category.toLowerCase(),
                quizType,
                score,
                totalQuestions,
                amount: Number(amount) || totalQuestions, // Convert to number and use provided amount or default to totalQuestions
                percentage,
                timeSpent: timeSpent || 0,
                submittedAt: admin.firestore.Timestamp.now(),
                difficulty: Number(difficulty), // Store as number to match database schema
                sessionId: sessionId || admin.firestore.FieldValue.serverTimestamp(),
                quizId: finalQuizId,
                questionIds: questionIds || [],
                userAnswers: userAnswers || {}
            };

            // Store result in quiz_results collection
            await admin.firestore().collection('quiz_results').add(quizResult);

            // Get user's current category stats
            const userRef = admin.firestore().collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const userData = userDoc.data();

            // Update user stats in atomic transaction
            const batch = admin.firestore().batch();

            // Base stats update - always update activity timestamps
            const baseUpdate = {
                'stats.lastActivity': admin.firestore.Timestamp.now(),
                'timestamps.lastActiveAt': admin.firestore.Timestamp.now()
            };

            // Update stats based on quiz type
            if (isDefaultQuiz) {
                // Default quiz: Update QuizMaster stats and category stats
                baseUpdate['stats.quizmasterQuizzesTaken'] = admin.firestore.FieldValue.increment(1);
                baseUpdate['stats.quizmasterTotalScore'] = admin.firestore.FieldValue.increment(percentage);

                const currentCategoryStats = userData.stats?.categoryStats?.[category.toLowerCase()] || {
                    best: 0,
                    avg: 0,
                    attempts: 0,
                    totalScore: 0
                };

                // Calculate new category stats
                const newAttempts = currentCategoryStats.attempts + 1;
                const newTotalScore = currentCategoryStats.totalScore + percentage;
                const newAvg = Math.round(newTotalScore / newAttempts);
                const newBest = Math.max(currentCategoryStats.best, percentage);

                // Add category-specific updates
                baseUpdate[`stats.categoryStats.${category.toLowerCase()}.best`] = newBest;
                baseUpdate[`stats.categoryStats.${category.toLowerCase()}.avg`] = newAvg;
                baseUpdate[`stats.categoryStats.${category.toLowerCase()}.attempts`] = newAttempts;
                baseUpdate[`stats.categoryStats.${category.toLowerCase()}.totalScore`] = newTotalScore;

                // Calculate overall QuizMaster average
                const currentQuizmasterTotal = userData.stats?.quizmasterTotalScore || 0;
                const currentQuizmasterTaken = userData.stats?.quizmasterQuizzesTaken || 0;
                const newQuizmasterTotal = currentQuizmasterTotal + percentage;
                const newQuizmasterTaken = currentQuizmasterTaken + 1;
                const newQuizmasterAverage = Math.round(newQuizmasterTotal / newQuizmasterTaken);

                baseUpdate['stats.quizmasterAverageScore'] = newQuizmasterAverage;
            } else {
                // Custom quiz: Update custom quiz activity only
                const currentCustomTotal = userData.stats?.customQuizActivity?.totalScore || 0;
                const currentCustomTaken = userData.stats?.customQuizActivity?.totalTaken || 0;
                const newCustomTotal = currentCustomTotal + percentage;
                const newCustomTaken = currentCustomTaken + 1;
                const newCustomAverage = Math.round(newCustomTotal / newCustomTaken);

                baseUpdate['stats.customQuizActivity.totalTaken'] = admin.firestore.FieldValue.increment(1);
                baseUpdate['stats.customQuizActivity.totalScore'] = admin.firestore.FieldValue.increment(percentage);
                baseUpdate['stats.customQuizActivity.averageScore'] = newCustomAverage;
                baseUpdate['stats.customQuizActivity.lastTaken'] = admin.firestore.Timestamp.now();
            }

            // Apply all updates
            batch.update(userRef, baseUpdate);

            await batch.commit();

            res.json({
                success: true,
                message: `${isDefaultQuiz ? 'Default' : 'Custom'} quiz results submitted successfully`,
                data: {
                    resultId: "stored",
                    percentage,
                    quizType,
                    isDefaultQuiz,
                    quizId: finalQuizId,
                    categoryStats: isDefaultQuiz ? {
                        [category.toLowerCase()]: {
                            best: baseUpdate[`stats.categoryStats.${category.toLowerCase()}.best`],
                            avg: baseUpdate[`stats.categoryStats.${category.toLowerCase()}.avg`],
                            attempts: baseUpdate[`stats.categoryStats.${category.toLowerCase()}.attempts`]
                        }
                    } : null,
                    quizmasterStats: isDefaultQuiz ? {
                        averageScore: baseUpdate['stats.quizmasterAverageScore'],
                        totalTaken: (userData.stats?.quizmasterQuizzesTaken || 0) + 1
                    } : null,
                    customQuizStats: !isDefaultQuiz ? {
                        averageScore: baseUpdate['stats.customQuizActivity.averageScore'],
                        totalTaken: (userData.stats?.customQuizActivity?.totalTaken || 0) + 1
                    } : null
                }
            });

        } catch (error) {
            console.error('Error submitting quiz results:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to submit quiz results'
            });
        }
    });
})

/**
 * Get quiz results for a user with optional filtering
 */
exports.getQuizResults = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { quizType, category, limit = 50, offset = 0 } = data

    try {
        let query = admin.firestore()
            .collection('quiz_results')
            .where('userId', '==', userId)
            .orderBy('submittedAt', 'desc')

        // Apply filters if provided
        if (quizType) {
            query = query.where('quizType', '==', quizType)
        }

        if (category) {
            query = query.where('category', '==', category.toLowerCase())
        }

        // Apply pagination
        if (offset > 0) {
            query = query.offset(offset)
        }

        query = query.limit(limit)

        const snapshot = await query.get()

        const results = []
        snapshot.forEach(doc => {
            results.push({
                id: doc.id,
                ...doc.data()
            })
        })

        return { results }
    } catch (error) {
        console.error('[getQuizResults] Error fetching quiz results:', error)
        throw new functions.https.HttpsError('internal', 'Error fetching quiz results')
    }
})

/**
 * Get detailed information about a specific quiz result
 */
exports.getQuizResultDetails = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { resultId } = data

    if (!resultId) {
        throw new functions.https.HttpsError('invalid-argument', 'Result ID is required')
    }

    try {
        const resultRef = admin.firestore().collection('quiz_results').doc(resultId)
        const doc = await resultRef.get()

        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Quiz result not found')
        }

        const resultData = doc.data()

        // Verify the result belongs to the user
        if (resultData.userId !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied')
        }

        return {
            id: doc.id,
            ...resultData
        }
    } catch (error) {
        console.error('[getQuizResultDetails] Error fetching quiz result details:', error)
        throw new functions.https.HttpsError('internal', 'Error fetching quiz result details')
    }
})

/**
 * Delete a quiz result
 */
exports.deleteQuizResult = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { resultId } = data

    if (!resultId) {
        throw new functions.https.HttpsError('invalid-argument', 'Result ID is required')
    }

    try {
        const resultRef = admin.firestore().collection('quiz_results').doc(resultId)

        // Verify the result belongs to the user
        const doc = await resultRef.get()
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Quiz result not found')
        }

        if (doc.data().userId !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied')
        }

        await resultRef.delete()

        return { success: true, message: 'Quiz result deleted successfully' }
    } catch (error) {
        console.error('[deleteQuizResult] Error deleting quiz result:', error)
        throw new functions.https.HttpsError('internal', 'Error deleting quiz result')
    }
})