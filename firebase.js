import firebase from  'firebase/compat/app'
import 'firebase/compat/auth'

const app = firebase.initializeApp({
    apiKey: "AIzaSyDGqWTZtmxOMfylYYkiN7FXjJqjTnY6FaQ",
    authDomain: "quizmaster-c66a2.firebaseapp.com",
    projectId: "quizmaster-c66a2",
    storageBucket: "quizmaster-c66a2.appspot.com",
    messagingSenderId: "991033062979",
    appId: "1:991033062979:web:ad93b752240e7bf28d86f6"
});

export const auth = app.auth()
export default app
