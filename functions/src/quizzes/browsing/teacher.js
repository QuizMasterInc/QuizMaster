const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

/**
 * Get teacher-made quizzes with server-side filtering
 */
exports.getTeacherQuizzes = onRequest({
    invoker: "public"
}, async (req, res) => {
    cors(req, res, async () => {
        try {
            const {
                searchTerm = '',
                sortBy = 'newest',
                limit = 50
            } = req.method === 'POST' ? req.body : req.query;

            console.log('Teacher quizzes query:', { searchTerm, sortBy, limit });

            let query = admin.firestore().collection('custom_quizzes');

            // Server-side filtering for teacher quizzes
            query = query.where('metadata.isTeacherMade', '==', true);

            // Handle sorting
            if (sortBy === 'newest') {
                query = query.orderBy('timestamps.updatedAt', 'desc');
            } else if (sortBy === 'oldest') {
                query = query.orderBy('timestamps.createdAt', 'asc');
            } else if (sortBy === 'title') {
                query = query.orderBy('metadata.title', 'asc');
            } else if (sortBy === 'titleReverse') {
                query = query.orderBy('metadata.title', 'desc');
            } else if (sortBy === 'shortest') {
                query = query.orderBy('metadata.questionCount', 'asc');
            } else if (sortBy === 'longest') {
                query = query.orderBy('metadata.questionCount', 'desc');
            } else {
                // Default to newest
                query = query.orderBy('timestamps.updatedAt', 'desc');
            }

            // Apply limit
            query = query.limit(parseInt(limit));

            const querySnapshot = await query.get();
            console.log('Teacher quizzes query returned:', querySnapshot.size, 'documents');

            const results = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();

                // Filter by search term if provided (client-side filtering for text search)
                if (searchTerm && searchTerm.trim()) {
                    const title = (data.metadata?.title || '').toLowerCase();
                    const tags = (data.metadata?.tags || '').toLowerCase();
                    const searchLower = searchTerm.toLowerCase();

                    if (!title.includes(searchLower) && !tags.includes(searchLower)) {
                        return; // Skip this quiz
                    }
                }

                // Map to the format expected by QuizList component
                const quiz = {
                    uid: doc.id,
                    title: data.metadata?.title || 'Untitled Quiz',
                    numQuestions: data.metadata?.questionCount || 0,
                    tags: data.metadata?.tags || '',
                    creator: data.creator?.displayName || data.creator?.username || 'Anonymous User',
                    quizPassword: data.metadata?.hasPassword ? 'protected' : null,
                    createdAt: data.timestamps?.createdAt,
                    updatedAt: data.timestamps?.updatedAt,
                    isTeacherMade: true // Explicitly mark as teacher quiz
                };

                results.push(quiz);
            });

            console.log('Processed', results.length, 'teacher quizzes');

            return res.json({
                success: true,
                quizzes: results,
                data: results,
                meta: {
                    count: results.length,
                    searchTerm,
                    sortBy,
                    limit: parseInt(limit),
                    timestamp: new Date().toISOString(),
                    message: 'Teacher quizzes retrieved with server-side filtering'
                }
            });

        } catch (error) {
            console.error('Error fetching teacher quizzes:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Failed to fetch teacher quizzes'
            });
        }
    });
});