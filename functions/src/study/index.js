const functions = require('firebase-functions')
const {onRequest, onCall} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})

/**
 * Get study material for a specific category
 */
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