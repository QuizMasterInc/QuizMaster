const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})
admin.initializeApp()

exports.grabQuiz = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const quiz = req.query.quiz
        const grabQuiz = await admin.firestore().collection('quizzes').doc(quiz).get()
        res.json(grabQuiz.data())
    })
})