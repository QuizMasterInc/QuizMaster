const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})
admin.initializeApp()

/**
 * This will add a question to the default-questions collection. It is mostly used for developers to add questions for quizzes. 
 */
exports.addDefaultQuestion = onRequest(async (req, res) => {
    cors(req, res, async () => {
      try {
        // Parse question into JavaScript object
        const question = JSON.parse(req.query.question)
  
        // Store the data in Firestore
        const collectionRef = admin.firestore().collection('default-questions')
        await collectionRef.add(question)
  
        res.json({ message: 'Data added to Firestore' })
      } catch (error) {
        console.error('Error adding data to Firestore:', error)
        res.status(500).json({ error: 'An error occurred' })
      }
    })
  })

/**
 * This will grab a custom quiz by id
 */
// Retrives quiz data and includes the option to download quizzes
exports.grabCustomQuiz = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const  uid  = req.query.quizid
        const download = req.query.download; // Checks if request is to download

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
            
            if (download === 'true') {
                // Handle OLD format (questions as map with option_1, option_2, etc.)
                const questions = quizData.content?.questions || quizData.questions || {};
                const studyGuide = Object.values(questions).map((q) => ({
                    question: q.question,
                    correctAnswer: q.correct_answer,
                    choices: [q.option_1, q.option_2, q.option_3, q.option_4].filter(Boolean)
                }));

                res.setHeader("Content-Disposition", "attachment; filename=study-guide.json");
                return res.status(200).json(studyGuide);
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

        // Increment attempt count and update last played time
        await quizRef.update({
            'analytics.stats.attempts': admin.firestore.FieldValue.increment(1),
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
                // Use access.privacy index
                query = query.where('access.privacy', '==', privacy);
            }
            
            // Apply sorting using indexed fields
            if (sortBy === 'newest') {
                query = query.orderBy('timestamps.updatedAt', 'desc');
            } else if (sortBy === 'oldest') {
                query = query.orderBy('timestamps.createdAt', 'asc');
            } else if (sortBy === 'title') {
                query = query.orderBy('metadata.title', 'asc');
            } else if (sortBy === 'attempts') {
                query = query.orderBy('analytics.stats.attempts', 'desc');
            } else if (sortBy === 'score') {
                query = query.orderBy('analytics.stats.averageScore', 'desc');
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
                        displayName: data.creator?.displayName || data.creator?.username || 'Anonymous User'
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
                            if (!Array.isArray(quizData) || quizData.length === 0) {
                                return {};
                            }
                            
                            const questionsMap = {};
                            quizData.forEach((q, index) => {
                                const questionKey = `Question ${index + 1}`;
                                const mappedQuestion = {
                                    question: q.question || '',
                                    correct_answer: q.correctAnswer || '',
                                    option_1: q.options?.[0] || '',
                                    option_2: q.options?.[1] || '',
                                    option_3: q.options?.[2] || '',
                                    option_4: q.options?.[3] || '',
                                    type: q.type || 'Multiple'
                                };
                                questionsMap[questionKey] = mappedQuestion;
                            });
                            return questionsMap;
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
                            'cache.recentQuizIds': admin.firestore.FieldValue.arrayUnion(docRef.id),
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

exports.getStudyMaterial = onRequest(async (req, res) => {
    cors(req, res, async () => {
      try {
        const category = req.query.category;
        if (!category) {
          throw new Error('Category parameter is required');
        }
  
        const snapshot = await admin.firestore().collection('studyMaterials').doc(category).get();
        if (!snapshot.exists) {
          throw new Error('Study material not found');
        }
  
        const data = snapshot.data();
        res.set('Access-Control-Allow-Origin', '*'); 
        res.status(200).json(data);
      } catch (error) {
        console.error('Error fetching study material:', error);
        res.status(500).send('Error fetching study material');
      }
    })
  })

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
 * V2: Optimized function with proper server-side filtering instead of client-side
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
                        
                        // Analytics from nested structure
                        totalAttempts: quizData.analytics.totalAttempts,
                        averageScore: quizData.analytics.averageScore,
                        
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
 * V2: Optimized subcategory function with server-side aggregation
 */
exports.grabSubV2 = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const category = req.query.category
        
        if (!category) {
            return res.status(400).json({ error: 'Missing category parameter' })
        }

        try {
            // Server-side filtering instead of fetching all documents
            const quizzes = await admin.firestore()
                .collection('default-questions')
                .where('category', '==', category)
                .orderBy('sub-category')
                .get()

            if (quizzes.empty) {
                res.set('Cache-Control', 'public, max-age=1800') // 30 minute cache for empty results
                return res.json({})
            }

            // Group by subcategory (this is efficient since we already filtered server-side)
            const subcategories = {}
            quizzes.forEach((doc) => {
                const data = doc.data()
                const subcategory = data['sub-category']
                
                if (!subcategories[subcategory]) {
                    subcategories[subcategory] = []
                }
                subcategories[subcategory].push(data)
            })

            res.set('Cache-Control', 'public, max-age=1800') // 30 minute cache
            res.json(subcategories)
            
        } catch (error) {
            console.error('Error fetching subcategories V2:', error)
            res.status(500).json({ error: 'Error fetching subcategories' })
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
 * Create a new flashcard deck
 */
exports.addCustomFlashcardDeck = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type');
        if (dataType === 'application/json') {
            const data = JSON.parse(JSON.stringify(req.body));

            // Extract data from request
            const creatorID = data.creator?.uid || data.creatorID;
            const title = data.metadata?.title || data.name || data.title;
            const cards = data.content?.cards || data.cards || [];
            const tags = data.metadata?.tags || data.tags || "";

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
                
                // Convert cards array to map format like custom_quizzes
                const cardsMap = {};
                cards.forEach((card, index) => {
                    const cardKey = `Card ${index + 1}`;
                    cardsMap[cardKey] = {
                        front: card.front || '',
                        back: card.back || '',
                        type: card.type || 'basic'
                    };
                });

                const newFlashcardDeck = {
                    // Metadata section
                    metadata: {
                        title: title,
                        description: data.metadata?.description || data.description || "",
                        category: data.metadata?.category || data.category || "General",
                        tags: Array.isArray(tags) ? tags.join(', ') : (tags || ""),
                        cardCount: cards.length,
                        isPublic: data.metadata?.isPublic || data.isPublic || false,
                        difficulty: data.metadata?.difficulty || data.difficulty || "2",
                        version: 1
                    },

                    // Creator information
                    creator: creatorInfo,

                    // Content - cards stored as map
                    content: {
                        cards: cardsMap
                    },

                    // Analytics - initialize empty
                    analytics: {
                        stats: {
                            timesStudied: 0,
                            averageScore: 0,
                            lastStudied: null,
                            totalReviews: 0
                        },
                        performance: {
                            cardStats: {}
                        }
                    },

                    // Access control
                    access: {
                        visibility: data.metadata?.isPublic || data.isPublic ? "public" : "private",
                        allowCopying: data.access?.allowCopying || true,
                        studyMode: data.access?.studyMode || "flashcards"
                    },

                    // Timestamps
                    timestamps: {
                        createdAt: currentDate,
                        updatedAt: currentDate,
                        lastStudiedAt: null
                    },

                    // Moderation
                    moderation: {
                        status: "active",
                        reports: [],
                        flags: []
                    }
                };

                // Save to Firestore
                const result = await admin.firestore().collection('flashcard_decks').add(newFlashcardDeck);
                
                // Update user stats and cache (similar to quiz creation)
                try {
                    if (userDoc.exists) {
                        await user.update({
                            'stats.flashcardDecksCreated': admin.firestore.FieldValue.increment(1),
                            'cache.recentFlashcardIds': admin.firestore.FieldValue.arrayUnion(result.id),
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
                .where('creator.uid', '==', userId)
                .where('moderation.status', '==', 'active')
                .orderBy('timestamps.updatedAt', 'desc');

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
            
            // Verify ownership
            if (deckData.creator.uid !== userId) {
                return res.json({
                    status: 403,
                    success: false,
                    message: "Unauthorized: You can only delete your own decks"
                });
            }

            // Soft delete by updating moderation status
            await admin.firestore().collection('flashcard_decks').doc(deckId).update({
                'moderation.status': 'deleted',
                'timestamps.updatedAt': new Date().toISOString(),
                'timestamps.deletedAt': new Date().toISOString()
            });

            // Update user stats: decrement deck count and remove from recent cache
            try {
                const user = admin.firestore().collection('users').doc(userId);
                await user.update({
                    'stats.flashcardDecksCreated': admin.firestore.FieldValue.increment(-1),
                    'cache.recentFlashcardIds': admin.firestore.FieldValue.arrayRemove(deckId),
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
                quizId = null
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

            // Calculate percentage
            const percentage = Math.round((score / totalQuestions) * 100);

            // Create quiz result document
            const quizResult = {
                userId,
                category: category.toLowerCase(),
                quizType,
                score,
                totalQuestions,
                percentage,
                timeSpent: timeSpent || 0,
                submittedAt: admin.firestore.Timestamp.now(),
                difficulty,
                sessionId: sessionId || admin.firestore.FieldValue.serverTimestamp()
            };

            // Add quizId for custom quizzes
            if (quizId) {
                quizResult.quizId = quizId;
            }

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
});