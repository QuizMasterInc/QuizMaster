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
                limit = 50,
                currentUserId = null
            } = req.method === 'POST' ? req.body : req.query;

            console.log('Query params:', { searchTerm, sortBy, privacy, limit, currentUserId });

            const collectionRef = admin.firestore().collection('custom_quizzes');
            const indexesUsed = {};

            const applySort = (query) => {
                if (sortBy === 'newest') {
                    indexesUsed.sortNewest = true;
                    return query.orderBy('timestamps.updatedAt', 'desc');
                }
                if (sortBy === 'oldest') {
                    indexesUsed.sortOldest = true;
                    return query.orderBy('timestamps.createdAt', 'asc');
                }
                if (sortBy === 'title') {
                    indexesUsed.sortTitleAZ = true;
                    return query.orderBy('metadata.title', 'asc');
                }
                if (sortBy === 'titleReverse') {
                    indexesUsed.sortTitleZA = true;
                    return query.orderBy('metadata.title', 'desc');
                }
                if (sortBy === 'shortest') {
                    indexesUsed.sortShortest = true;
                    return query.orderBy('metadata.questionCount', 'asc');
                }
                if (sortBy === 'longest') {
                    indexesUsed.sortLongest = true;
                    return query.orderBy('metadata.questionCount', 'desc');
                }
                indexesUsed.sortDefault = true;
                return query.orderBy('timestamps.updatedAt', 'desc');
            };

            const baseQuery = collectionRef.where('metadata.isTeacherMade', '==', false);
            const queries = [];

            if (privacy === 'public') {
                queries.push(baseQuery.where('metadata.isPublic', '==', true));
                indexesUsed.privacyFilter = 'public';
                console.log('Filtering for public quizzes only (metadata.isPublic == true)');
            } else if (privacy === 'private') {
                if (currentUserId) {
                    queries.push(
                        baseQuery
                            .where('creator.uid', '==', currentUserId)
                            .where('metadata.isPublic', '==', false)
                    );
                }
                indexesUsed.privacyFilter = 'private';
                console.log('Filtering for private quizzes only (current user only)');
            } else {
                queries.push(baseQuery.where('metadata.isPublic', '==', true));

                if (currentUserId) {
                    queries.push(
                        baseQuery
                            .where('creator.uid', '==', currentUserId)
                            .where('metadata.isPublic', '==', false)
                    );
                }

                indexesUsed.privacyFilter = currentUserId ? 'allPublicAndOwnPrivate' : 'allPublicOnly';
                console.log('Showing public quizzes and current user private quizzes when available');
            }

            const querySnapshots = await Promise.all(
                queries.map((q) => applySort(q).limit(parseInt(limit)).get())
            );

            const results = [];
            const seenIds = new Set();

            querySnapshots.forEach((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (seenIds.has(doc.id)) return;
                    seenIds.add(doc.id);

                    const data = doc.data();
                    results.push({ id: doc.id, data });
                });
            });

            const normalizeResult = ({ id, data }) => {
                return {
                    id,
                    title: data.metadata?.title || 'Untitled Quiz',
                    numQuestions: data.metadata?.questionCount || 0,
                    tags: data.metadata?.tags || '',
                    creator: data.creator?.displayName || data.creator?.username || 'Anonymous User',
                    quizPassword: data.metadata?.hasPassword ? 'protected' : null,
                    hasPassword: data.metadata?.hasPassword || false,
                    password: data.metadata?.password || null,
                    metadata: {
                        title: data.metadata?.title || 'Untitled Quiz',
                        tags: data.metadata?.tags ? [data.metadata.tags] : [],
                        isPublic: data.metadata?.isPublic || false,
                        questionCount: data.metadata?.questionCount || 0,
                        hasPassword: data.metadata?.hasPassword || false,
                        password: data.metadata?.password || null
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
                    uid: id,
                    creatorID: data.creator?.uid || 'Unknown',
                    questionCount: data.metadata?.questionCount || 0,
                    isPrivate: !data.metadata?.isPublic,
                    quizTaken: data.analytics?.stats?.attempts || 0
                };
            };

            const normalized = results
                .map(normalizeResult)
                .filter((quiz) => {
                    if (searchTerm && searchTerm.trim()) {
                        const lowerSearch = searchTerm.toLowerCase();
                        const titleMatch = (quiz.title || '').toLowerCase().includes(lowerSearch);
                        const tagMatch = Array.isArray(quiz.metadata?.tags)
                            ? quiz.metadata.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
                            : false;
                        return titleMatch || tagMatch;
                    }
                    return true;
                });

            const sortResults = (quizArray) => {
                return quizArray.sort((a, b) => {
                    if (sortBy === 'newest') {
                        return (new Date(b.timestamps.updatedAt).getTime() || 0) - (new Date(a.timestamps.updatedAt).getTime() || 0);
                    }
                    if (sortBy === 'oldest') {
                        return (new Date(a.timestamps.createdAt).getTime() || 0) - (new Date(b.timestamps.createdAt).getTime() || 0);
                    }
                    if (sortBy === 'title') {
                        return (a.title || '').localeCompare(b.title || '');
                    }
                    if (sortBy === 'titleReverse') {
                        return (b.title || '').localeCompare(a.title || '');
                    }
                    if (sortBy === 'shortest') {
                        return (a.numQuestions || 0) - (b.numQuestions || 0);
                    }
                    if (sortBy === 'longest') {
                        return (b.numQuestions || 0) - (a.numQuestions || 0);
                    }
                    return (new Date(b.timestamps.updatedAt).getTime() || 0) - (new Date(a.timestamps.updatedAt).getTime() || 0);
                });
            };

            const finalResults = sortResults(normalized).slice(0, parseInt(limit));

            console.log('Processed', finalResults.length, 'documents successfully');

            return res.json({
                success: true,
                quizzes: finalResults,
                data: finalResults,
                meta: {
                    count: finalResults.length,
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