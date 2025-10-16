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
            // Try lowercase first
            const lowercaseCategory = category.toLowerCase();
            console.log('[grabSubV2] Trying lowercase:', lowercaseCategory);

            let quizzes = await admin.firestore()
                .collection('default-questions')
                .where('category', '==', lowercaseCategory)
                .orderBy('sub-category')
                .get()

            console.log('[grabSubV2] Lowercase query returned:', quizzes.size, 'documents');

            // If no results, try with first letter capitalized
            if (quizzes.empty) {
                const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
                console.log('[grabSubV2] Trying capitalized:', capitalizedCategory);

                quizzes = await admin.firestore()
                    .collection('default-questions')
                    .where('category', '==', capitalizedCategory)
                    .orderBy('sub-category')
                    .get()

                console.log('[grabSubV2] Capitalized query returned:', quizzes.size, 'documents');
            }

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
            // Try lowercase first
            const lowercaseCategory = category.toLowerCase();

            let quizzes = await admin.firestore()
                .collection('default-questions')
                .where('category', '==', lowercaseCategory)
                .get()

            // If no results, try with first letter capitalized
            if (quizzes.empty) {
                const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()

                quizzes = await admin.firestore()
                    .collection('default-questions')
                    .where('category', '==', capitalizedCategory)
                    .get()
            }

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