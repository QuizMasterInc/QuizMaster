const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

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
 * V2: Optimized subcategory function with server-side aggregation
 */
exports.grabSubV2 = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const category = req.query.category

        console.log('[grabSubV2] Received request for category:', category);

        if (!category) {
            return res.status(400).json({ error: 'Missing category parameter' })
        }

        try {
            // Use lowercase category (standardized format)
            const lowercaseCategory = category.toLowerCase();
            console.log('[grabSubV2] Using lowercase category:', lowercaseCategory);

            let quizzes = await admin.firestore()
                .collection('default-questions')
                .where('category', '==', lowercaseCategory)
                .orderBy('sub-category')
                .get()

            console.log('[grabSubV2] Query returned:', quizzes.size, 'documents');

            if (quizzes.empty) {
                console.log('[grabSubV2] No questions found! Checking total collection size...');

                // Check if collection has ANY documents
                const allDocs = await admin.firestore()
                    .collection('default-questions')
                    .limit(5)
                    .get();

                console.log('[grabSubV2] Total documents in collection (sample):', allDocs.size);

                if (!allDocs.empty) {
                    const categories = new Set();
                    allDocs.forEach(doc => {
                        const data = doc.data();
                        categories.add(data.category);
                    });
                    console.log('[grabSubV2] Available categories in database:', Array.from(categories));
                }

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
                // Include the document ID as questionId
                subcategories[subcategory].push({
                    ...data,
                    questionId: doc.id
                })
            })

            console.log('[grabSubV2] Returning subcategories:', Object.keys(subcategories), 'with total questions:', quizzes.size);

            res.set('Cache-Control', 'public, max-age=1800') // 30 minute cache
            res.json(subcategories)

        } catch (error) {
            console.error('[grabSubV2] Error fetching subcategories:', error)
            res.status(500).json({ error: 'Error fetching subcategories' })
        }
    })
})

/**
 * Get available subcategories for a specific category
 * This dynamically fetches subcategories from the database instead of using hardcoded values
 */
exports.getSubcategories = onRequest(async (req, res) => {
    cors(req, res, async () => {
        const category = req.query.category

        console.log('[getSubcategories] Received request for category:', category);

        if (!category) {
            return res.status(400).json({ error: 'Missing category parameter' })
        }

        try {
            // Use lowercase category (standardized format)
            const lowercaseCategory = category.toLowerCase();

            let quizzes = await admin.firestore()
                .collection('default-questions')
                .where('category', '==', lowercaseCategory)
                .get()

            if (quizzes.empty) {
                console.log('[getSubcategories] No questions found for category:', category);
                res.set('Cache-Control', 'public, max-age=1800')
                return res.json({ subcategories: [] })
            }

            // Extract unique subcategories
            const subcategoriesSet = new Set();
            quizzes.forEach((doc) => {
                const data = doc.data()
                const subcategory = data['sub-category']
                if (subcategory && subcategory.trim() !== '') {
                    subcategoriesSet.add(subcategory)
                }
            })

            const subcategories = Array.from(subcategoriesSet).sort();

            console.log('[getSubcategories] Found subcategories:', subcategories);

            res.set('Cache-Control', 'public, max-age=1800') // 30 minute cache
            res.json({ subcategories })

        } catch (error) {
            console.error('[getSubcategories] Error fetching subcategories:', error)
            res.status(500).json({ error: 'Error fetching subcategories' })
        }
    })
})

/**
 * Get all custom questions for a specific user
 */
exports.getCustomQuestions = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid

    try {
        const questionsRef = admin.firestore().collection('custom-questions')
        const snapshot = await questionsRef.where('userId', '==', userId).get()

        const questions = []
        snapshot.forEach(doc => {
            questions.push({
                id: doc.id,
                ...doc.data()
            })
        })

        return { questions }
    } catch (error) {
        console.error('[getCustomQuestions] Error fetching custom questions:', error)
        throw new functions.https.HttpsError('internal', 'Error fetching custom questions')
    }
})

/**
 * Add a new custom question for a user
 */
exports.addCustomQuestion = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { question } = data

    if (!question) {
        throw new functions.https.HttpsError('invalid-argument', 'Question data is required')
    }

    try {
        const questionsRef = admin.firestore().collection('custom-questions')
        const newQuestion = {
            ...question,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }

        const docRef = await questionsRef.add(newQuestion)

        return {
            id: docRef.id,
            ...newQuestion
        }
    } catch (error) {
        console.error('[addCustomQuestion] Error adding custom question:', error)
        throw new functions.https.HttpsError('internal', 'Error adding custom question')
    }
})

/**
 * Update an existing custom question
 */
exports.updateCustomQuestion = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { questionId, question } = data

    if (!questionId || !question) {
        throw new functions.https.HttpsError('invalid-argument', 'Question ID and question data are required')
    }

    try {
        const questionRef = admin.firestore().collection('custom-questions').doc(questionId)

        // Verify the question belongs to the user
        const doc = await questionRef.get()
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Question not found')
        }

        if (doc.data().userId !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied')
        }

        const updatedQuestion = {
            ...question,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }

        await questionRef.update(updatedQuestion)

        return {
            id: questionId,
            ...doc.data(),
            ...updatedQuestion
        }
    } catch (error) {
        console.error('[updateCustomQuestion] Error updating custom question:', error)
        throw new functions.https.HttpsError('internal', 'Error updating custom question')
    }
})

/**
 * Delete a custom question
 */
exports.deleteCustomQuestion = onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const userId = context.auth.uid
    const { questionId } = data

    if (!questionId) {
        throw new functions.https.HttpsError('invalid-argument', 'Question ID is required')
    }

    try {
        const questionRef = admin.firestore().collection('custom-questions').doc(questionId)

        // Verify the question belongs to the user
        const doc = await questionRef.get()
        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Question not found')
        }

        if (doc.data().userId !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied')
        }

        await questionRef.delete()

        return { success: true, message: 'Question deleted successfully' }
    } catch (error) {
        console.error('[deleteCustomQuestion] Error deleting custom question:', error)
        throw new functions.https.HttpsError('internal', 'Error deleting custom question')
    }
})