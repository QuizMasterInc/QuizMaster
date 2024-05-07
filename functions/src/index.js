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
 * TODO
 */
exports.grabRandom = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const category = req.query.category
        const quizzes = await admin.firestore().collection('default-questions').get()
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

exports.addDefaultQuestion = functions.https.onRequest(async (req, res) => {
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
  
exports.grabUser = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const uid = req.query.uid
        const grabUser = await admin.firestore().collection('users').doc(uid).get()
        res.json(grabUser.data())
    })
})
//Used by CustomQuizTables for get all user's custom quizzes
exports.grabUserCustomQuzzies = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const uid = req.query.uid
        const customQuizzes = await admin.firestore().collection('custom_quizzes').get()
        const quizzes = []
        customQuizzes.forEach((doc) => {
            const data = doc.data()
            creator = data.creator
            if (creator === uid) {
                quizzes.push(data)
            }
        })
        res.json(quizzes)
    })
})

/**
 * This function will set a new score for a recently taken quiz
 * The attempts are set to 1 and the score and avgScore are set to 
 * the same value as this is the first time a user has taken a quiz.
 * @param {*} newScore the new score from a recently taken quiz
 * @param {*} uid userID
 * @param {*} category quiz category
 * @param {*} attempts how many times the user has taken that quiz
 * @param {*} avgScore the average score for that quiz
 */
async function setNewScore(newScore, uid, category, attempts, avgScore){
    await admin.firestore().collection('users').doc(uid).collection('quizzes').doc(category).set({
        score: newScore,
        attempts: attempts,
        avgScore: avgScore
    })
}

/**
 * This function will update the score in the database, if there is one
 * @param {*} savedScore score from database
 * @param {*} newScore score from recently taken quiz
 * @param {*} uid userID
 * @param {*} category quiz category
 */
async function updateScore(savedScore, newScore, uid, category){
    if (savedScore < newScore){
        await admin.firestore().collection('users').doc(uid).collection('quizzes').doc(category).update({
            score: newScore
        })
    }
}

/**
 * This function will update the average score in the database, if there is one
 * and if it is higher than the previously stored best score
 * @param {*} newAvg new calculated average score
 * @param {*} newScore score from recently taken quiz
 * @param {*} uid userID
 * @param {*} category quiz category
 */
async function updateAvgScore(newScore, uid, category, newAvg) {
    if (newAvg != newScore) {
        await admin.firestore().collection('users').doc(uid).collection('quizzes').doc(category).update({
            avgScore: newAvg,
        })
    }
  }

  /**
 * This function will update the score in the database, if there is one
 * @param {*} newAttempts attempt counter incremented
 * @param {*} uid userID
 * @param {*} category quiz category
 */
async function updateAttempts(uid, category, newAttempts){
        await admin.firestore().collection('users').doc(uid).collection('quizzes').doc(category).update({
            attempts: newAttempts
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
                const resultsRef = await admin.firestore().collection('users').doc(data.uid).collection('quizzes').doc(data.category).get()
                if(!resultsRef.exists){
                    //doc doesnt exist, so we create a new one
                    const newScore = data.score
                    const uid = data.uid
                    const category = data.category
                    const attempts = data.attempts
                    const avgScore = data.avgScore
                    setNewScore(newScore, uid, category, attempts, avgScore)
                }else{
                    //doc exists, so we grab the current values and update them accordingly
                    const savedScore = resultsRef.data().score
                    const savedAvgScore = resultsRef.data().avgScore
                    const savedAttempts = resultsRef.data().attempts
                    const newScore = data.score
                    const uid = data.uid
                    const category = data.category
                    const newAttempts = data.attempts + 1
                    const newAvg = (((savedAvgScore * savedAttempts) + newScore) / newAttempts)
                    
                    updateScore(savedScore, newScore, uid, category)
                    updateAvgScore(newScore, uid, category, newAvg)
                    updateAttempts(uid, category, newAttempts)
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
 * if they dont exist we return 0 for all values
 * This is used for the dashboard and for updating quiz scores
 */
exports.grabResults = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))
            try{
                const resultsRef = await admin.firestore().collection('users').doc(data.uid).collection('quizzes').doc(data.category).get()
                if(!resultsRef.exists){
                    //doc doesnt exist
                    res.json({score: 0, avgScore: 0, attempts: 0})
                }else{
                    //doc exists 
                    console.log(resultsRef.data())
                    res.json(resultsRef.data())
                }
            }catch(error){
                console.log(error)
                res.status(500).send('Error fetching data.');
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
        displayName: user.displayName,
        customQuizzes: [],
        role: 'user'
    })
})

// auth trigger (user deleted)
// deletes user from firestore
exports.deletedUser = functions.auth.user().onDelete(user => {
    console.log("user deleted", user.email, user.uid)
    const doc = admin.firestore().collection('users').doc(user.uid)
    return doc.delete()
})

exports.grabCustomQuiz = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const  uid  = req.query.quizid

        if (!uid) {
            return res.status(401).json({
                result: false,
                message: "No UID field."
            })
        }

        try {
            const quiz = await admin.firestore().collection('custom_quizzes').doc(uid).get()
            if (!quiz.exists) {
                return res.json({
                    result: false,
                    message: "Invalid UID"
                })
            }
            else {
                return res.json({
                    result: true,
                    status: 200,
                    message: "quiz found",
                    data: quiz.data()
                })
            }
        } catch(error) {
            return res.json({
                result: false,
                message: error.message
            })
        }
    }) 
})

// grabs all custom quizzes made by current user for Dashboard
// Is duplicate of grabUserCustomQuzzies(), replace in later update
exports.grabCustomQuizzesByUser = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const creator = req.query.creator
        try {
            const userRef = await admin.firestore().collection("users").doc(creator).get()

            if (!userRef.exists) {
                return res.json({
                    result: false, 
                    status: 404,
                    message: "user not found"
                })
            }

            const userQuizzes = await userRef.data().customQuizzes
            const senderData = []
            for (var i = 0; i < userQuizzes.length; i++) {
                const quizRef = await admin.firestore().collection("custom_quizzes").doc(userQuizzes[i]).get()

                if (quizRef.exists) {
                    senderData.push({
                        uid: userQuizzes[i],
                        data: quizRef.data()
                    })
                }
            }

            return res.json({
                result: true,
                status: 200,
                message: "user's quizzes retrieved",
                data: senderData
            })
        } catch(error) {
            return res.json({
                result: false,
                message: error.message
            })
        }
        
    }) 
})

// grabs all custom quizzes for the Take A Quiz -> User-Made Quizzes page
exports.grabAllCustomQuizzes = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const quizSnapshot = await admin.firestore().collection('custom_quizzes').orderBy('createdAt', 'desc').get()
            allQuizzes = []
            quizSnapshot.forEach(doc => {
                const data = {
                    ...doc.data(),
                    uid: doc.id,
                }
                allQuizzes.push(data)
            })
            return res.json({
                result: true,
                status: 200,
                message: "custom quizzes retrieved",
                data: allQuizzes
            })
            
            
        } catch(error) {
            return res.json({
                result: false,
                message: error.message
            })
        }

    })
})

// function adds new quiz to the DB and updates in the users collection
exports.addCustomQuiz = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')
        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))

            // checks incoming data before attempting to store in DB
            if (!data.creatorID || data.title == "" || data.numQuestions == 0) {
                return res.json({
                    status: 404, 
                    message: "Missing Parameters"
                })
            }

            try{
                const user = await admin.firestore().collection('users').doc(data.creatorID)
                if (data.quizPassword) {
                    await admin.firestore().collection('custom_quizzes').add({
                        quizPassword: data.quizPassword,
                        creator: data.creatorID,
                        title: data.title, 
                        numQuestions: data.questionCount,
                        questions: data.quizData, 
                        createdAt: admin.firestore.Timestamp.now().toDate().toString(),
                        lastEdit: admin.firestore.Timestamp.now().toDate().toString(),
                        tags: data.quizTags
                    })
                    .then((docRef) => {
                        console.log("docRef-ID", docRef.id)
                        try {
                            user.update({
                                customQuizzes: admin.firestore.FieldValue.arrayUnion(docRef.id)
                            })
                        } catch(error) {
                            console.log("Error adding to user doc", error.message)
                        }
                        return res.json({
                            status: 200,
                            quizID: docRef.id,
                            message: "Added to DB successfully"
                        })
                    })
                } else {
                   await admin.firestore().collection('custom_quizzes').add({
                        creator: data.creatorID,
                        title: data.title, 
                        numQuestions: data.questionCount,
                        questions: data.quizData, 
                        createdAt: admin.firestore.Timestamp.now().toDate().toString(),
                        lastEdit: admin.firestore.Timestamp.now().toDate().toString(),
                        quizTaken: 0,
                        tags: data.quizTags
                    }) 
                    .then((docRef) => {
                        console.log("docRef-ID", docRef.id)
                        try {
                            user.update({
                                customQuizzes: admin.firestore.FieldValue.arrayUnion(docRef.id)
                            })
                        } catch(error) {
                            console.log("Error adding to user doc", error.message)
                        }
                        return res.json({
                            status: 200,
                            quizID: docRef.id,
                            message: "Added to DB successfully"
                        })
                    })
                }
            }catch(error){
                return res.json({
                    result: false,
                    message: error.message
                })
            }
        }
    })
})

exports.deleteCustomQuiz = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const  uid  = req.query.quizid

        if (!uid || uid == "" || uid == " ") {
            return res.status(401).json({
                result: false,
                message: "No UID field."
            })
        }

        try {
            const quiz = (await admin.firestore().collection("custom_quizzes").doc(uid).get()).data()


            await admin.firestore().collection("users").doc(quiz.creator).update({
                customQuizzes: admin.firestore.FieldValue.arrayRemove(uid)
            })

            await admin.firestore().collection("custom_quizzes").doc(uid).delete()

            return res.json({
                result: true,
                status: 200,
                message: "Successful Deletion"
            })
        } catch(error) {
            return res.json({
                result: false,
                error: true,
                message: error.message
            })
        }
    }) 
})

exports.editUserInfo = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')

        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))
            
            // check for empty object 
            if (!data) {
                return res.status(404).json({
                    result: false,
                    message: "No data to update"
                })
            }

            // check if user exists
            const user = await admin.firestore().collection('users').doc(data.uid).get()

            if (!user.exists) {
                return res.status(404).json({
                    result: false,
                    error: "User not found."
                })
            }

            // update the user 
            try {
                if (data.nRole) {
                    // updating the users role
                    await admin.firestore().collection('users').doc(data.uid).update({
                        role: data.nRole
                    })
                }
                else if (data.nEmail) {
                    // update email 
                    await admin.firestore().collection('users').doc(data.uid).update({
                        email: data.nEmail
                    })

                    // update auth 
                    await admin.auth().updateUser(data.uid, {
                        email: data.nEmail
                    })
                }
            } catch(err) {
                // return error response
                return res.status(404).json({
                    result: false,
                    error: err.message
                })
            }
            
            // return statement
            return res.status(200).json({
                result: true,
                status: 200,
                message: "User info successfully updated."
            })
        }
    })
})

exports.editQuizInfo = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const dataType = req.get('content-type')

        if(dataType === 'application/json'){
            const data = JSON.parse(JSON.stringify(req.body))
            
            // check for empty object 
            if (!data) {
                return res.status(404).json({
                    result: false,
                    message: "No data to update"
                })
            }

            // check for quiz existnace
            const quiz = await admin.firestore().collection("custom_quizzes").doc(data.uid).get()
            if (!quiz.exists) {
                return res.status(404).json({
                    result: false, 
                    message: "Quiz does not exist"
                })
            }

            // update the quiz 
            try {
                if (data.sendData.title != "") {
                    // update the title
                    await admin.firestore().collection("custom_quizzes").doc(data.uid).update({
                        title: data.sendData.title
                    })
                }

                if (data.sendData.questions != null) {
                    await admin.firestore().collection("custom_quizzes").doc(data.uid).update({
                        questions: data.sendData.questions
                    })
                }
            } catch(err) {
                // return error response
                return res.status(404).json({
                    result: false,
                    error: err.message
                })
            }
            
            // return statement
            return res.status(200).json({
                result: true,
                status: 200,
                message: "Quiz info successfully updated."
            })
        }
    })
})

exports.getStudyMaterial = functions.https.onRequest(async (req, res) => {
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