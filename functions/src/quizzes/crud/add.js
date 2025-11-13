const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

// function adds new quiz to the DB and updates in the users collection
exports.addCustomQuiz = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))

            // Extract data from new nested schema format
            const creatorID = data.creator.userId;
            const title = data.metadata.title;
            const numQuestions = data.content.totalQuestions;
            const quizData = data.content.questions;
            const quizPassword = data.metadata.password;
            const quizTags = data.metadata.tags;

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
                    // Metadata section - matches new nested schema
                    metadata: {
                        title: title,
                        description: data.metadata.description || "",
                        tags: Array.isArray(quizTags) ? quizTags.join(', ') : (quizTags || ""),
                        category: data.metadata.category || "",
                        questionCount: numQuestions,
                        isPublic: !quizPassword,
                        hasPassword: !!quizPassword,
                        password: quizPassword || null,
                        difficulty: data.metadata.difficulty || "3",
                        version: 1,
                        isTeacherMade: data.metadata.isTeacherMade || false
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