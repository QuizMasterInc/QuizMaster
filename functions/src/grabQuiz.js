const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

exports.grabQuiz = functions.https.onRequest(async (req, res) => {
    const quiz = req.query.quiz
    const grabQuiz = await admin.firestore().collection('quizzes').doc(quiz).get()
    res.json(grabQuiz.data())
})