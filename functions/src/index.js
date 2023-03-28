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

exports.saveResults = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))
            console.log(data)
            //res.json(data.body)
        }
    })
})
