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

async function updateScore(savedScore, newScore, uid, category){
    if (savedScore < newScore){
        await admin.firestore().collection('results').doc(uid).collection('quizzes').doc(category).update({
            score: newScore
        })
    }
}

async function setNewScore(newScore, uid, category){
    await admin.firestore().collection('results').doc(uid).collection('quizzes').doc(category).set({
        score: newScore
    })
}

exports.saveResults = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))
            try{
                const resultsRef = await admin.firestore().collection('results').doc(data.uid).collection('quizzes').doc(data.category).get()
                console.log(resultsRef.data())
                if(!resultsRef.exists){
                    //doc doesnt exist
                    const newScore = data.score
                    const uid = data.uid
                    const category = data.category
                    setNewScore(newScore, uid, category)
                }else{
                    //doc exists 
                    if(!resultsRef.data().score){
                        await admin.firestore().collection('results').doc(data.uid).collection('quizzes').doc(data.category).update({
                            score: data.score
                        })
                    }
                    const savedScore = resultsRef.data().score
                    const newScore = data.score
                    const uid = data.uid
                    const category = data.category
                    updateScore(savedScore, newScore, uid, category)
                }
                res.json({result: true})
            }catch(error){
                res.json({result: false})
            }
        }
    })
})
