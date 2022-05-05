import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCZ9kbsSse3GhBojutVCRvTZq2iVUK3xHA",
    authDomain: "testingwithnode.firebaseapp.com",
    projectId: "testingwithnode",
    storageBucket: "testingwithnode.appspot.com",
    messagingSenderId: "1028278565411",
    appId: "1:1028278565411:web:a242ad515deb3ec276cf96"
};

initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();

//signing users up (Automatically logs user in as soon as he/she signs in)
if (document.querySelector(".sign-up")) {
    const signupForm = document.querySelector(".sign-up");
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = signupForm.email.value;
        const password = signupForm.password.value;
        const displayName = signupForm.displayName.value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((cred) => {
                alert("user created and signed in");
                console.log("user created:", cred.user);
                signupForm.reset();

                // creating user document in database with display name
                const userEmail = email;
                const userUrl = "user?email="+email+"&displayName="+displayName;
                const createUser = fetch(userUrl);
                // Storing display Name to display on the home page and welcome user.
                sessionStorage.setItem("displayName", displayName);
                sessionStorage.setItem("email", userEmail);

                window.location.href = "./index.html";
            })
            .catch((err) => {
                alert(err.message);
            });
    });
} else {
    //console.log("This page does not contain sing-up class, or not in sign up page") ;
}

//logging out
setTimeout(() => {
    const logoutButton = document.querySelector(".sign-out");
    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                alert("signed out");
                console.log("user signed out");
                //redirect back to home
                window.location.href = "./index.html";
            })
            .catch((err) => {
                console.log(err.message);
            });
    });
}, 2000);

// logging in
if (document.querySelector(".log-in")) {
    const loginForm = document.querySelector(".log-in");
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        signInWithEmailAndPassword(auth, email, password)
            .then((cred) => {
                alert("logged in");
                console.log("user logged in:", cred.user);
                loginForm.reset();
                // Calling function to retrieve the display name of the user to display on home page.
                fetchUserDisplayName(email).then(function (result) {
                    sessionStorage.setItem("displayName", result.display_name);
                    sessionStorage.setItem("email", email);
                }).then(function(){
                    window.location.href = "./index.html";
                })
            })
            .catch((err) => {
                console.log(err.message);
            });
    });
} else {
    //console.log("This page does not contain login class, or not in sign in page");

}

// Tracks whether user is logged in or not (tracks state).
setTimeout(() => {
    onAuthStateChanged(auth, (user) => {
        console.log("user status changed:, ", user);
        if (user) {
            sessionStorage.setItem("email", user.email);
            if(sessionStorage.getItem("displayName") == null){
                // Calling function to retrieve the display name of the user to display on home page.
                fetchUserDisplayName(sessionStorage.getItem("email")).then(function (result) {
                    // setting up the displayName to display to home page.
                    sessionStorage.setItem("displayName", result.display_name);
                    // Inserting display name to home page.
                    if(document.querySelector(".welcome")){
                        document.querySelector(".welcome").innerHTML = ", "+ sessionStorage.getItem("displayName");
                    }
                });
            }else{
                if(document.querySelector(".welcome")){
                    document.querySelector(".welcome").innerHTML = ", "+ sessionStorage.getItem("displayName");
                }
            }
            // Will set up the menu bar options.
            setupUserUI(user);
        } else {
            setupUserUI(null);
        }
    });
}, 150);

// Hide menu options depending if user is logged out or in.
const setupUserUI = (user) => {
    const loggedOutLinks = document.querySelectorAll(".logged-out"); // selects the menu options when logged out.
    const loggedInLinks = document.querySelectorAll(".logged-in"); // selects the menu options when logged in.
    const defaultLinks = document.querySelectorAll(".default"); // selects the menu options outside of logged in/out.

    if (user) {
        // displaying menu options for menu bar.
        console.log("setupUserUI, logged in.");
        // toggle UI elements
        defaultLinks.forEach((item) => (item.style.display = "block"));
        loggedInLinks.forEach((item) => (item.style.display = "block"));
        loggedOutLinks.forEach((item) => (item.style.display = "none"));
    } else {
        console.log("setupUserUI, not logged in.");
        // toggle UI elements
        if (document.querySelector("#main-menu")) {
            defaultLinks.forEach((item) => (item.style.display = "block"));
            loggedInLinks.forEach((item) => (item.style.display = "none"));
            loggedOutLinks.forEach((item) => (item.style.display = "block"));
        }
    }
};

// // END OF FIREBASE SECTION

// Function to fetch userDisplayName route and retrieve the display name. 
async function fetchUserDisplayName(email){
    const userEmail = email;
    const userUrl = "userDisplayName?email="+email;
    console.log(userUrl);
    const userDisplayName = await fetch(userUrl);
    const userDisplayNameResponse = await userDisplayName.json();

    return userDisplayNameResponse;
};

async function dumpSession() {
    //console.log(sessionStorage.getItem("email"));

    return sessionStorage.getItem("email");
};


export {dumpSession};

