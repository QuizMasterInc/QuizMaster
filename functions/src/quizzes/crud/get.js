const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

/**
 * This will grab a custom quiz by id
 */
exports.grabCustomQuiz = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const  uid  = req.query.quizid

        if (!uid) {
            return res.status(401).json({
                result: false,
                message: "No UID field."
            });
        }

        try {
            const quiz = await admin.firestore().collection('custom_quizzes').doc(uid).get()
            if (!quiz.exists) {
                return res.json({
                    result: false,
                    message: "Invalid UID"
                });
            }
            const quizData = quiz.data();

            // Check if quiz requires password verification (new schema only)
            const requiresPassword = quizData.metadata?.hasPassword;
            const providedPassword = req.query.password || req.body?.password;

            if (requiresPassword) {
                const correctPassword = quizData.metadata.password;
                if (!providedPassword || providedPassword !== correctPassword) {
                    return res.status(401).json({
                        result: false,
                        message: "Password required",
                        requiresPassword: true
                    });
                }
            }

            return res.json({
                result: true,
                status: 200,
                message: "Quiz found.",
                data: {
                    ...quizData,
                    questions: quizData.content?.questions || quizData.questions || {}
                }
            });

        } catch(error) {
            return res.json({
                result: false,
                message: error.message
            });
        }
    });
});

// grabs all custom quizzes for the Take A Quiz -> User-Made Quizzes page
// OPTIMIZED VERSION using Firestore indexes for better performance
exports.grabAllCustomQuizzes = onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            // Parse query parameters for optimized filtering
            const {
                limit = 100,
                privacy = 'all',
                sortBy = 'newest',
                useIndexes = true,
                fields = []
            } = req.method === 'POST' ? req.body : req.query;

            let query = admin.firestore().collection('custom_quizzes');

            // Exclude teacher-made quizzes from general browsing
            query = query.where('metadata.isTeacherMade', '==', false);
            if (useIndexes && privacy !== 'all') {
                // Filter by metadata.isPublic field
                const isPublic = privacy === 'public';
                query = query.where('metadata.isPublic', '==', isPublic);
            }

            // Apply sorting using indexed fields
            if (sortBy === 'newest') {
                query = query.orderBy('timestamps.updatedAt', 'desc');
            } else if (sortBy === 'oldest') {
                query = query.orderBy('timestamps.createdAt', 'asc');
            } else if (sortBy === 'title') {
                query = query.orderBy('metadata.title', 'asc');
            } else {
                // Default to newest
                query = query.orderBy('timestamps.updatedAt', 'desc');
            }

            // Apply limit for pagination
            query = query.limit(parseInt(limit));

            const quizSnapshot = await query.get();
            const allQuizzes = [];

            quizSnapshot.forEach(doc => {
                const quizData = doc.data();

                // Only flatten fields that are actually needed (for efficiency)
                const flattenedQuiz = {
                    uid: doc.id,

                    // Core metadata using indexed fields
                    title: quizData.metadata?.title || 'Untitled Quiz',
                    description: quizData.metadata?.description || '',
                    category: quizData.metadata?.category || 'General',
                    tags: quizData.metadata?.tags || [],
                    difficulty: quizData.metadata?.difficulty || '3',

                    // Content info - check new location first
                    numQuestions: quizData.metadata?.questionCount || quizData.content?.totalQuestions || 0,
                    questionCount: quizData.metadata?.questionCount || quizData.content?.totalQuestions || 0,

                    // Creator info from nested structure
                    creator: quizData.creator?.userId || 'Unknown',
                    creatorName: quizData.creator?.username || '',
                    creatorVerified: quizData.creator?.verified || false,

                    // Access control - read from metadata.isPublic per DATABASE_SCHEMA
                    isPublic: quizData.metadata?.isPublic ?? true, // Default to public if not specified
                    privacy: quizData.metadata?.isPublic === false ? 'private' : 'public',
                    quizPassword: quizData.metadata?.password || null,

                    // Analytics using indexed stats
                    attempts: quizData.analytics?.stats?.attempts || 0,
                    averageScore: quizData.analytics?.stats?.averageScore || 0,
                    completions: quizData.analytics?.stats?.completions || 0,

                    // Timestamps using indexed date fields
                    createdAt: quizData.timestamps?.createdAt,
                    updatedAt: quizData.timestamps?.updatedAt,
                    lastAttemptAt: quizData.timestamps?.lastAttemptAt,

                    // Moderation status
                    status: quizData.moderation?.status || 'active',
                    isActive: quizData.moderation?.status === 'active'
                };

                allQuizzes.push(flattenedQuiz);
            });

            // Additional sorting is no longer needed since we use indexed orderBy
            // The results are already sorted by the database using indexes

            return res.json({
                result: true,
                status: 200,
                message: "Custom quizzes retrieved using optimized indexes",
                data: allQuizzes,
                meta: {
                    count: allQuizzes.length,
                    sortBy: sortBy,
                    privacy: privacy,
                    useIndexes: useIndexes,
                    timestamp: new Date().toISOString(),
                    indexesUsed: {
                        privacy: privacy !== 'all',
                        sorting: true,
                        timestamps: true
                    }
                }
            })


        } catch(error) {
            return res.json({
                result: false,
                message: error.message
            })
        }

    })
})

/**
 * Get ALL quiz results for a user in a single call
 */
exports.grabUserCustomQuizzesV2 = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if (dataType === 'application/json') {
            const data = JSON.parse(JSON.stringify(req.body))
            const { uid } = data

            if (!uid) {
                return res.status(400).json({ error: 'Missing uid parameter' })
            }

            try {
                // EFFICIENT: Query new schema only - creator.uid with nested timestamps
                const customQuizzesQuery = await admin.firestore()
                    .collection('custom_quizzes')
                    .where('creator.uid', '==', uid)
                    .orderBy('timestamps.createdAt', 'desc')
                    .get()

                if (customQuizzesQuery.empty) {
                    res.set('Cache-Control', 'public, max-age=300') // 5 minute cache
                    return res.json({
                        success: true,
                        data: [],
                        message: 'No custom quizzes found'
                    })
                }

                if (customQuizzesQuery.empty) {
                    res.set('Cache-Control', 'public, max-age=300') // 5 minute cache
                    return res.json({
                        success: true,
                        data: [],
                        message: 'No custom quizzes found'
                    })
                }

                // Convert to array format expected by frontend - NEW SCHEMA ONLY
                const customQuizzes = []
                customQuizzesQuery.forEach(doc => {
                    const quizData = doc.data()

                    // New nested schema structure only
                    const flattenedQuiz = {
                        uid: doc.id,
                        title: quizData.metadata.title,
                        numQuestions: quizData.metadata.questionCount,
                        questionCount: quizData.metadata.questionCount,
                        tags: quizData.metadata.tags,
                        isPublic: quizData.metadata.isPublic,
                        hasPassword: quizData.metadata.hasPassword,

                        // Creator info from nested structure
                        creator: quizData.creator.uid,
                        creatorName: quizData.creator.displayName,
                        creatorRole: quizData.creator.role,

                        // Questions and password from nested structure
                        questions: quizData.content.questions,
                        quizPassword: quizData.metadata.password,

                        // Timestamps from nested structure
                        createdAt: quizData.timestamps.createdAt,
                        updatedAt: quizData.timestamps.updatedAt
                    }

                    customQuizzes.push(flattenedQuiz)
                })
                res.set('Cache-Control', 'public, max-age=600') // 10 minute cache
                res.json({
                    success: true,
                    data: customQuizzes,
                    count: customQuizzes.length,
                    timestamp: new Date().toISOString()
                })

            } catch (error) {
                console.error('Error fetching user custom quizzes V2:', error)
                res.status(500).json({
                    success: false,
                    error: 'Error fetching user quizzes',
                    timestamp: new Date().toISOString()
                })
            }
        } else {
            res.status(400).json({ error: 'Invalid content type. Expected application/json' })
        }
    })
})