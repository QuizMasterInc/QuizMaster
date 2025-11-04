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

            // Check if quiz requires password verification
            const requiresPassword = quizData.metadata?.hasPassword || quizData.password;
            const providedPassword = req.query.password || req.body?.password;

            if (requiresPassword) {
                const correctPassword = quizData.password || quizData.metadata?.password;
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

/**
 * Track quiz attempt - increment analytics when someone starts taking a quiz
 * CONVERTED TO CALLABLE FUNCTION to fix CORS issues and maintain architectural consistency
 */
exports.trackQuizAttempt = onCall(async (request) => {
    // Extract data from callable function request
    const { quizId } = request.data;

    if (!quizId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Quiz ID is required'
        );
    }

    try {
        const quizRef = admin.firestore().collection('custom_quizzes').doc(quizId);
        const quizDoc = await quizRef.get();

        if (!quizDoc.exists) {
            throw new functions.https.HttpsError(
                'not-found',
                'Quiz not found'
            );
        }

        // Update last played time
        await quizRef.update({
            'timestamps.lastAttemptAt': admin.firestore.Timestamp.now(),
            'timestamps.updatedAt': admin.firestore.Timestamp.now()
        });

        return {
            success: true,
            message: "Quiz attempt tracked"
        };

    } catch (error) {
        console.error('Error tracking quiz attempt:', error);

        // Re-throw HttpsError if it's already an HttpsError
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        // Otherwise, wrap in internal error
        throw new functions.https.HttpsError(
            'internal',
            'Error tracking quiz attempt'
        );
    }
})

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

            // Leverage Firestore indexes for efficient queries
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

                    // Access control using indexed privacy field
                    privacy: quizData.access?.visibility || 'public',
                    isPublic: quizData.access?.visibility === 'public',
                    quizPassword: quizData.access?.password || null,

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

// FOCUSED BROWSE FUNCTION - Handles UI filter options with proper privacy filtering
exports.browseCustomQuizzesOptimized = onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const {
                searchTerm = '',
                sortBy = 'newest',
                privacy = 'all',
                limit = 50
            } = req.method === 'POST' ? req.body : req.query;

            console.log('Query params:', { searchTerm, sortBy, privacy, limit });

            let query = admin.firestore().collection('custom_quizzes');
            const indexesUsed = {};

            // Handle privacy filtering using your actual schema field: metadata.isPublic
            if (privacy === 'public') {
                query = query.where('metadata.isPublic', '==', true);
                indexesUsed.privacyFilter = 'public';
                console.log('Filtering for public quizzes only (metadata.isPublic == true)');
            } else if (privacy === 'private') {
                query = query.where('metadata.isPublic', '==', false);
                indexesUsed.privacyFilter = 'private';
                console.log('Filtering for private quizzes only (metadata.isPublic == false)');
            } else {
                console.log('Showing all quizzes (no privacy filter)');
            }

            // Handle sorting - using your ACTUAL schema fields
            if (sortBy === 'newest') {
                query = query.orderBy('timestamps.updatedAt', 'desc');
                indexesUsed.sortNewest = true;
            } else if (sortBy === 'oldest') {
                query = query.orderBy('timestamps.createdAt', 'asc');
                indexesUsed.sortOldest = true;
            } else if (sortBy === 'title') {
                query = query.orderBy('metadata.title', 'asc');
                indexesUsed.sortTitleAZ = true;
            } else if (sortBy === 'titleReverse') {
                query = query.orderBy('metadata.title', 'desc');
                indexesUsed.sortTitleZA = true;
            } else if (sortBy === 'shortest') {
                query = query.orderBy('metadata.questionCount', 'asc');
                indexesUsed.sortShortest = true;
            } else if (sortBy === 'longest') {
                query = query.orderBy('metadata.questionCount', 'desc');
                indexesUsed.sortLongest = true;
            } else {
                // Default to newest
                query = query.orderBy('timestamps.updatedAt', 'desc');
                indexesUsed.sortDefault = true;
            }

            // Apply limit
            query = query.limit(parseInt(limit));

            console.log('Executing query with indexes:', indexesUsed);
            const querySnapshot = await query.get();
            console.log('Query successful, got', querySnapshot.size, 'documents');

            const results = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();

                // Filter by search term if provided (client-side filtering)
                if (searchTerm && searchTerm.trim()) {
                    const title = (data.metadata?.title || '').toLowerCase();
                    const tags = (data.metadata?.tags || '').toLowerCase();
                    const searchLower = searchTerm.toLowerCase();

                    if (!title.includes(searchLower) && !tags.includes(searchLower)) {
                        return; // Skip this quiz
                    }
                }

                // Map your actual schema to what the UI expects
                const quiz = {
                    id: doc.id,

                    // Core quiz info using actual schema
                    title: data.metadata?.title || 'Untitled Quiz',
                    numQuestions: data.metadata?.questionCount || 0,
                    tags: data.metadata?.tags || '',
                    creator: data.creator?.displayName || data.creator?.username || 'Anonymous User', // Use display name, not UID!
                    quizPassword: data.metadata?.hasPassword ? 'protected' : null,

                    // Password information for frontend
                    hasPassword: data.metadata?.hasPassword || false,
                    password: data.password || null, // PASSWORD IS AT ROOT LEVEL, NOT IN METADATA

                    // Additional fields for AllCustomQuizzes mapping with correct schema
                    metadata: {
                        title: data.metadata?.title || 'Untitled Quiz',
                        tags: data.metadata?.tags ? [data.metadata.tags] : [],
                        isPublic: data.metadata?.isPublic || false,
                        questionCount: data.metadata?.questionCount || 0,
                        hasPassword: data.metadata?.hasPassword || false,
                        password: data.password || null // PASSWORD IS AT ROOT LEVEL, NOT IN METADATA
                    },
                    content: {
                        totalQuestions: data.metadata?.questionCount || 0
                    },
                    creator: {
                        userId: data.creator?.uid || 'Unknown',
                        displayName: data.creator?.displayName || 'Anonymous User'
                    },
                    access: {
                        password: data.metadata?.hasPassword ? 'protected' : null
                    },
                    timestamps: {
                        createdAt: data.timestamps?.createdAt,
                        updatedAt: data.timestamps?.updatedAt
                    },

                    // Legacy fields for backward compatibility
                    uid: doc.id,
                    creatorID: data.creator?.uid || 'Unknown',
                    questionCount: data.metadata?.questionCount || 0,
                    isPrivate: !data.metadata?.isPublic,

                    // Password information for frontend
                    hasPassword: data.metadata?.hasPassword || false,
                    password: data.password ? 'protected' : null
                };

                results.push(quiz);
            });

            console.log('Processed', results.length, 'documents successfully');

            return res.json({
                success: true,
                quizzes: results, // Use 'quizzes' key to match AllCustomQuizzes expectation
                data: results,
                meta: {
                    count: results.length,
                    searchTerm,
                    sortBy,
                    privacy,
                    limit: parseInt(limit),
                    indexesUsed,
                    queryTime: new Date().toISOString(),
                    message: 'Query with proper privacy filtering and display names'
                }
            });

        } catch (error) {
            console.error('Browse error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Failed to browse quizzes'
            });
        }
    });
});

// function adds new quiz to the DB and updates in the users collection
exports.addCustomQuiz = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))

            // Handle both OLD and NEW schema formats from frontend
            const creatorID = data.creator?.userId || data.creatorID;
            const title = data.metadata?.title || data.title;
            const numQuestions = data.content?.totalQuestions || data.numQuestions || 0;
            const quizData = data.content?.questions || data.quizData;
            const quizPassword = data.access?.password || data.quizPassword;
            const quizTags = data.metadata?.tags || data.quizTags || "";

            // checks incoming data before attempting to store in DB
            if (!creatorID || title == "" || numQuestions == 0) {
                return res.json({
                    status: 404,
                    message: "Missing Parameters"
                })
            }

            try {
                const user = await admin.firestore().collection('users').doc(creatorID)
                const userDoc = await user.get()

                // Get creator information for denormalization
                let creatorInfo = {
                    uid: creatorID,  // Use the extracted creatorID, not data.creatorID
                    displayName: 'Anonymous User',
                    role: 'user'
                }

                if (userDoc.exists) {
                    const userData = userDoc.data()
                    creatorInfo = {
                        uid: creatorID,  // Use the extracted creatorID
                        displayName: userData.profile?.displayName || userData.displayName || `${userData.profile?.firstName || 'Anonymous'} ${userData.profile?.lastName || 'User'}`.trim(),
                        role: userData.role || 'user'
                    }
                }

                // Create schema structure matching your ACTUAL database schema
                const currentDate = new Date().toISOString();

                const newQuizData = {
                    // Metadata section - matches your actual schema
                    metadata: {
                        title: title,
                        description: data.metadata?.description || data.description || "",
                        tags: Array.isArray(quizTags) ? quizTags.join(', ') : (quizTags || ""),  // Convert array to string
                        category: data.metadata?.category || data.category || "",
                        questionCount: numQuestions,  // In metadata, not content
                        isPublic: !quizPassword,  // Boolean privacy field in metadata
                        hasPassword: !!quizPassword,
                        difficulty: "3",
                        version: 1
                    },

                    // Creator Information - matches your schema
                    creator: {
                        uid: creatorID,
                        displayName: creatorInfo.displayName,
                        username: creatorInfo.displayName
                    },

                    // Quiz Content - Store in OLD format that actually works
                    content: {
                        questions: (() => {
                            if (!quizData) {
                                return {};
                            }

                            // Handle if quizData is already an object (from createQuizDataObject)
                            if (typeof quizData === 'object' && !Array.isArray(quizData)) {
                                return quizData; // Already in correct format
                            }

                            // Handle if quizData is an array (legacy format)
                            if (Array.isArray(quizData)) {
                                if (quizData.length === 0) {
                                    return {};
                                }

                                const questionsMap = {};
                                quizData.forEach((q, index) => {
                                    const questionKey = `Question ${index + 1}`;
                                    const mappedQuestion = {
                                        question: q.question || '',
                                        correct_answer: q.correct_answer || q.correctAnswer || '',
                                        option_1: q.option_1 || q.options?.[0] || '',
                                        option_2: q.option_2 || q.options?.[1] || '',
                                        option_3: q.option_3 || q.options?.[2] || '',
                                        option_4: q.option_4 || q.options?.[3] || '',
                                        type: q.type || 'Multiple',
                                        difficulty: q.difficulty || 3,
                                        explanation: q.explanation || '',
                                        points: q.points || 1
                                    };
                                    questionsMap[questionKey] = mappedQuestion;
                                });
                                return questionsMap;
                            }

                            return {};
                        })()
                    },

                    // Timestamps as strings - consistently use ISO strings
                    timestamps: {
                        createdAt: currentDate,
                        updatedAt: currentDate
                    }
                }

                // Add password at root level if provided (matches your actual database structure)
                if (quizPassword) {
                    newQuizData.password = quizPassword;
                }

                // Add quiz to database (same logic for both password and public quizzes)
                const docRef = await admin.firestore().collection('custom_quizzes').add(newQuizData);

                try {
                    // Check if user document exists first
                    const userDoc = await user.get()
                    if (userDoc.exists) {
                        // Update user stats with consistent timestamp format (strings)
                        await user.update({
                            'stats.quizzesCreated': admin.firestore.FieldValue.increment(1),
                            'recentActivity.quizIds': admin.firestore.FieldValue.arrayUnion(docRef.id),
                            'timestamps.updatedAt': currentDate,  // Use string format consistently
                            'timestamps.lastActiveAt': currentDate
                        })
                    }
                } catch(error) {
                    // Error updating user stats - silent fail
                    console.error('Error updating user stats:', error);
                }

                return res.json({
                    status: 200,
                    quizID: docRef.id,
                    message: "Added to DB successfully"
                })

            } catch(error) {
                return res.json({
                    result: false,
                    message: error.message
                })
            }
        }
    })
})

/**
 * V2: Optimized quiz browsing with server-side filtering, sorting, and searching
 */
exports.browseCustomQuizzesV2 = onRequest(async (req, res) => {
    cors(req, res, async () => {
      if (req.get("content-type") !== "application/json") {
        return res.status(400).json({ error: "Invalid content type. Expected application/json" });
      }

      const {
        searchTerm = "",
        sortBy = "newest",
        privacy = "all",
        limit = 50,
        currentUserId = null
      } = req.body;

      try {
        let query = admin.firestore().collection("custom_quizzes");

        // Privacy filter
        if (privacy === "public") {
          query = query.where("isPublic", "==", true);
        } else if (privacy === "private" && currentUserId) {
          query = query
            .where("creator", "==", currentUserId)
            .where("isPublic", "==", false);
        }

        // Sorting
        switch (sortBy) {
          case "newest":
            query = query.orderBy("createdAt", "desc");
            break;
          case "oldest":
            query = query.orderBy("createdAt", "asc");
            break;
          case "title":
            query = query.orderBy("title", "asc");
            break;
          case "titleReverse":
            query = query.orderBy("title", "desc");
            break;
          case "shortest":
            query = query.orderBy("numQuestions", "asc");
            break;
          case "longest":
            query = query.orderBy("numQuestions", "desc");
            break;
          default:
            query = query.orderBy("createdAt", "desc");
        }

        // Apply limit
        query = query.limit(Math.min(limit, 100));

        const snapshot = await query.get();
        const quizzes = [];

        snapshot.forEach(doc => {
          const data = doc.data();

          // Post-query text filtering
          if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            const titleMatch = (data.title || "").toLowerCase().includes(lowerSearch);
            const tagMatch = Array.isArray(data.tags) && data.tags.some(tag => tag.toLowerCase().includes(lowerSearch));

            if (!titleMatch && !tagMatch) {
              return; // skip
            }
          }

          quizzes.push({
            uid: doc.id,
            title: data.title || "Untitled Quiz",
            numQuestions: data.numQuestions || 0,
            createdAt: data.createdAt || null, // keep raw string
            lastEdit: data.lastEdit || null,
            creator: data.creator || null,
            tags: Array.isArray(data.tags) ? data.tags : [],
            isPublic: data.isPublic || false,
            quizPassword: data.quizPassword ? "***" : null,
            quizTaken: data.quizTaken || 0
          });
        });

        res.set("Cache-Control", "public, max-age=300"); // 5 min cache
        res.json({
          success: true,
          data: quizzes,
          count: quizzes.length,
          searchTerm,
          sortBy,
          privacy,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("Error browsing custom quizzes V2:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Error fetching quiz results",
          timestamp: new Date().toISOString()
        });
      }
    });
});

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
                        quizPassword: quizData.content.password,

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

/**
 * Update an existing custom quiz
 */
exports.updateCustomQuiz = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { quizId, quizData } = data

    if (!quizId || !quizData) {
        throw new functions.https.HttpsError('invalid-argument', 'Quiz ID and quiz data are required')
    }

    try {
        const quizRef = admin.firestore().collection('custom_quizzes').doc(quizId)

        // Verify the quiz belongs to the user
        const doc = await quizRef.get()
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Quiz not found')
        }

        const existingData = doc.data()
        if (existingData.creator?.uid !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied')
        }

        // Prepare update data
        const updateData = {
            ...quizData,
            'timestamps.updatedAt': admin.firestore.Timestamp.now()
        }

        await quizRef.update(updateData)

        return {
            id: quizId,
            ...existingData,
            ...updateData
        }
    } catch (error) {
        console.error('[updateCustomQuiz] Error updating custom quiz:', error)
        throw new functions.https.HttpsError('internal', 'Error updating custom quiz')
    }
})

/**
 * Delete a custom quiz
 */
exports.deleteCustomQuiz = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { quizId } = data

    if (!quizId) {
        throw new functions.https.HttpsError('invalid-argument', 'Quiz ID is required')
    }

    try {
        const quizRef = admin.firestore().collection('custom_quizzes').doc(quizId)

        // Verify the quiz belongs to the user
        const doc = await quizRef.get()
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Quiz not found')
        }

        if (doc.data().creator?.uid !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied')
        }

        await quizRef.delete()

        return { success: true, message: 'Quiz deleted successfully' }
    } catch (error) {
        console.error('[deleteCustomQuiz] Error deleting custom quiz:', error)
        throw new functions.https.HttpsError('internal', 'Error deleting custom quiz')
    }
})