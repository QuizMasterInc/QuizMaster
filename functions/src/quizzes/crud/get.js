const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

exports.grabCustomQuiz = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const uid = req.query.quizid

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

            const requiresPassword = quizData.metadata?.hasPassword;

            if (requiresPassword) {
                let requestingUid = null;
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    try {
                        const idToken = authHeader.split('Bearer ')[1];
                        const decoded = await admin.auth().verifyIdToken(idToken);
                        requestingUid = decoded.uid;
                    } catch (authErr) {
                        console.warn('Failed to verify auth token:', authErr.message);
                    }
                }

                const isCreator = requestingUid && quizData.creator?.uid === requestingUid;
                const isAllowedUser = requestingUid &&
                    Array.isArray(quizData.metadata?.allowedUsers) &&
                    quizData.metadata.allowedUsers.includes(requestingUid);

                if (!isCreator && !isAllowedUser) {
                    const providedPassword = req.query.password || req.body?.password;
                    const correctPassword = quizData.metadata.password;

                    if (!providedPassword || providedPassword !== correctPassword) {
                        return res.status(401).json({
                            result: false,
                            message: "Password required",
                            requiresPassword: true
                        });
                    }

                    if (requestingUid) {
                        try {
                            await admin.firestore().collection('custom_quizzes').doc(uid).update({
                                'metadata.allowedUsers': admin.firestore.FieldValue.arrayUnion(requestingUid)
                            });
                        } catch (updateErr) {
                            console.error('Failed to add user to allowedUsers:', updateErr.message);
                        }
                    }
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

exports.grabAllCustomQuizzes = onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const {
                limit = 100,
                privacy = 'all',
                sortBy = 'newest',
                useIndexes = true,
                fields = []
            } = req.method === 'POST' ? req.body : req.query;

            let query = admin.firestore().collection('custom_quizzes');

            query = query.where('metadata.isTeacherMade', '==', false);
            if (useIndexes && privacy !== 'all') {
                const isPublic = privacy === 'public';
                query = query.where('metadata.isPublic', '==', isPublic);
            }

            if (sortBy === 'newest') {
                query = query.orderBy('timestamps.updatedAt', 'desc');
            } else if (sortBy === 'oldest') {
                query = query.orderBy('timestamps.createdAt', 'asc');
            } else if (sortBy === 'title') {
                query = query.orderBy('metadata.title', 'asc');
            } else {
                query = query.orderBy('timestamps.updatedAt', 'desc');
            }

            query = query.limit(parseInt(limit));

            const quizSnapshot = await query.get();
            const allQuizzes = [];

            quizSnapshot.forEach(doc => {
                const quizData = doc.data();

                const flattenedQuiz = {
                    uid: doc.id,

                    title: quizData.metadata?.title || 'Untitled Quiz',
                    description: quizData.metadata?.description || '',
                    category: quizData.metadata?.category || 'General',
                    tags: quizData.metadata?.tags || [],
                    difficulty: quizData.metadata?.difficulty || '3',

                    numQuestions: quizData.metadata?.questionCount || quizData.content?.totalQuestions || 0,
                    questionCount: quizData.metadata?.questionCount || quizData.content?.totalQuestions || 0,

                    creator: quizData.creator?.userId || 'Unknown',
                    creatorName: quizData.creator?.username || '',
                    creatorVerified: quizData.creator?.verified || false,

                    isPublic: quizData.metadata?.isPublic ?? true,
                    privacy: quizData.metadata?.isPublic === false ? 'private' : 'public',
                    quizPassword: quizData.metadata?.password || null,

                    attempts: quizData.analytics?.stats?.attempts || 0,
                    averageScore: quizData.analytics?.stats?.averageScore || 0,
                    completions: quizData.analytics?.stats?.completions || 0,

                    createdAt: quizData.timestamps?.createdAt,
                    updatedAt: quizData.timestamps?.updatedAt,
                    lastAttemptAt: quizData.timestamps?.lastAttemptAt,

                    status: quizData.moderation?.status || 'active',
                    isActive: quizData.moderation?.status === 'active'
                };

                allQuizzes.push(flattenedQuiz);
            });

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
                const customQuizzesQuery = await admin.firestore()
                    .collection('custom_quizzes')
                    .where('creator.uid', '==', uid)
                    .orderBy('timestamps.createdAt', 'desc')
                    .get()

                if (customQuizzesQuery.empty) {
                    res.set('Cache-Control', 'public, max-age=300')
                    return res.json({
                        success: true,
                        data: [],
                        message: 'No custom quizzes found'
                    })
                }

                if (customQuizzesQuery.empty) {
                    res.set('Cache-Control', 'public, max-age=300')
                    return res.json({
                        success: true,
                        data: [],
                        message: 'No custom quizzes found'
                    })
                }

                const customQuizzes = []
                customQuizzesQuery.forEach(doc => {
                    const quizData = doc.data()

                    const flattenedQuiz = {
                        uid: doc.id,
                        title: quizData.metadata.title,
                        numQuestions: quizData.metadata.questionCount,
                        questionCount: quizData.metadata.questionCount,
                        tags: quizData.metadata.tags,
                        isPublic: quizData.metadata.isPublic,
                        hasPassword: quizData.metadata.hasPassword,

                        creator: quizData.creator.uid,
                        creatorName: quizData.creator.displayName,
                        creatorRole: quizData.creator.role,

                        questions: quizData.content.questions,
                        quizPassword: quizData.metadata.password,

                        createdAt: quizData.timestamps.createdAt,
                        updatedAt: quizData.timestamps.updatedAt
                    }

                    customQuizzes.push(flattenedQuiz)
                })
                res.set('Cache-Control', 'public, max-age=600')
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