const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

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

            // Exclude teacher-made quizzes from general browsing
            query = query.where('metadata.isTeacherMade', '==', false);

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
                    password: data.metadata?.password || null, // Password stored in metadata

                    // Additional fields for AllCustomQuizzes mapping with correct schema
                    metadata: {
                        title: data.metadata?.title || 'Untitled Quiz',
                        tags: data.metadata?.tags ? [data.metadata.tags] : [],
                        isPublic: data.metadata?.isPublic || false,
                        questionCount: data.metadata?.questionCount || 0,
                        hasPassword: data.metadata?.hasPassword || false,
                        password: data.metadata?.password || null // Password stored in metadata
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
                    password: data.metadata?.password ? 'protected' : null
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

        // Privacy filter using new nested schema
        if (privacy === "public") {
          query = query.where("metadata.isPublic", "==", true);
        } else if (privacy === "private" && currentUserId) {
          query = query
            .where("creator.uid", "==", currentUserId)
            .where("metadata.isPublic", "==", false);
        }

        // Sorting using new nested schema
        switch (sortBy) {
          case "newest":
            query = query.orderBy("timestamps.updatedAt", "desc");
            break;
          case "oldest":
            query = query.orderBy("timestamps.createdAt", "asc");
            break;
          case "title":
            query = query.orderBy("metadata.title", "asc");
            break;
          case "titleReverse":
            query = query.orderBy("metadata.title", "desc");
            break;
          case "shortest":
            query = query.orderBy("metadata.questionCount", "asc");
            break;
          case "longest":
            query = query.orderBy("metadata.questionCount", "desc");
            break;
          default:
            query = query.orderBy("timestamps.updatedAt", "desc");
        }

        // Apply limit
        query = query.limit(Math.min(limit, 100));

        const snapshot = await query.get();
        const quizzes = [];

        snapshot.forEach(doc => {
          const data = doc.data();

          // Post-query text filtering using new schema
          if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            const titleMatch = (data.metadata?.title || "").toLowerCase().includes(lowerSearch);
            const tagMatch = Array.isArray(data.metadata?.tags) && data.metadata.tags.some(tag => tag.toLowerCase().includes(lowerSearch));

            if (!titleMatch && !tagMatch) {
              return; // skip
            }
          }

          quizzes.push({
            uid: doc.id,
            title: data.metadata?.title || "Untitled Quiz",
            numQuestions: data.metadata?.questionCount || 0,
            createdAt: data.timestamps?.createdAt || null,
            lastEdit: data.timestamps?.updatedAt || null,
            creator: data.creator?.displayName || data.creator?.username || "Anonymous User",
            tags: Array.isArray(data.metadata?.tags) ? data.metadata.tags : [],
            isPublic: data.metadata?.isPublic || false,
            quizPassword: data.metadata?.hasPassword ? "***" : null,
            quizTaken: data.analytics?.stats?.attempts || 0
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