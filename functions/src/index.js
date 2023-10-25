/**
 * This file are the various firebase functions we are using
 */
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require("cors")({origin: true})
admin.initializeApp()

/**
 * This will grab the quiz from the database
 * It takes the category and will take that specific quiz from the DB
 */


exports.grabQuiz = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const quiz = req.query.quiz
        const grabQuiz = await admin.firestore().collection('quizzes').doc(quiz).get()
        res.json(grabQuiz.data())
    })
})


/**
 * Take category
 * Return subcategories
 */

exports.grabSub = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const category = req.query.category
        const quizzes = await admin.firestore().collection('default-questions').where('category', '==', category).get()
        const subcategories = {}
        quizzes.forEach((doc) => {
            const data = doc.data()
            const subcategory = data['sub-category']
            if (!subcategories[subcategory]) {
                subcategories[subcategory] = []
              }
            subcategories[subcategory].push(data)
          });
        res.json(subcategories)
    })
})


/**
 * This function will update the score in the database, if there is one
 * @param {*} savedScore score from database
 * @param {*} newScore score from recently taken quiz
 * @param {*} uid userID
 * @param {*} category quiz category
 */
async function updateScore(savedScore, newScore, uid, category){
    if (savedScore < newScore){
        await admin.firestore().collection('results').doc(uid).collection('quizzes').doc(category).update({
            score: newScore
        })
    }
}

/**
 * This function will set a new score for a recently taken quiz
 * @param {*} newScore the new score from a recently taken quiz
 * @param {*} uid userID
 * @param {*} category quiz category
 */
async function setNewScore(newScore, uid, category){
    await admin.firestore().collection('results').doc(uid).collection('quizzes').doc(category).set({
        score: newScore
    })
}

/**
 * This function will update or set a new score depending on if the user has already taken a quiz or not
 * This only updates the score if the score was greater than the saved score
 */
exports.saveResults = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))
            try{
                const resultsRef = await admin.firestore().collection('results').doc(data.uid).collection('quizzes').doc(data.category).get()
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

/**
 * This function grabs the scores for the user from the DB
 * if they dont exist we return 0 
 */
exports.grabResults = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))
            try{
                const resultsRef = await admin.firestore().collection('results').doc(data.uid).collection('quizzes').doc(data.category).get()
                if(!resultsRef.exists){
                    //doc doesnt exist
                    res.json({score: 0})
                }else{
                    //doc exists 
                    res.json(resultsRef.data())
                }
            }catch(error){
                console.log(error)
            }
        }
    })
})

// auth trigger (new user registers)
// adds user to firestore from auth 
exports.newUser = functions.auth.user().onCreate(user => {
    console.log('user created', user.email, user.uid)
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email, 
        customQuizzes: []
    })
})

// auth trigger (user deleted)
// deletes user from firestore
exports.deletedUser = functions.auth.user().onDelete(user => {
    console.log("user deleted", user.email, user.uid)
    const doc = admin.firestore().collection('users').doc(user.uid)
    return doc.delete()
})

// function adds new quiz to the DB and updates in the users collection
exports.addCustomQuiz = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))

            // checks incoming data before attempting to store in DB
            if (!data.creatorID || data.title == "") res.json("Failed to add custom quiz. Missing parameters")

            try{
                const quiz = await admin.firestore.collection('custom_quizzes').add({
                    creator: data.creatorID,
                    title: data.title, 
                    numQuestions: data.questionCount,
                    questions: data.quizData, 
                    createdAt: Date(),
                    quizTaken: 0
                })

                const user = await admin.firestore.collection('users').doc(data.creatorID).get()
                const newArr = user.customQuizzes
                newArr.push(quiz.uid)
                await admin.firestore.collection('users').doc(data.creatorID).update({
                    customQuizzes: newArr
                })
                res.json(quiz.data())
            }catch(error){
                res.json({result: false})
            }
        }
    })
})