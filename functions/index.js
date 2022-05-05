const functions = require("firebase-functions");
const express = require("express");
var bodyParser = require("body-parser");

const app = express();
const path = require("path");
const { MongoClient, Db } = require("mongodb");
const { clearScreenDown } = require("readline");

const uri =
    //"mongodb+srv://cortezB:cortezPassword@quizcluster.5oc2z.mongodb.net/Quiz-Capstone?retryWrites=true&w=majority"
    "mongodb+srv://HenriA:HenrisPassword@quizcluster.5oc2z.mongodb.net/Quiz-Capstone?retryWrites=true&w=majority";
const client = new MongoClient(uri);
app.use(express.static(path.join(__dirname, "static")));
//test
app.use = bodyParser.json();
app.use = bodyParser.urlencoded({ extended: true });

//app.use =(express.urlencoded({extended: true}));
//app.use =(express.json()); // To parse the incoming request with JSON payloads
//end test
async function main() {
    try {
        // Will connect to database as soon as user enters the site.
        await client.connect();
    } catch (e) {
        console.error(e);
    } finally {
        //await client.close();
    }
}

//Create a new score in the database
async function createScore(client, email, quizName, quizScore) {
    //Retrieve student whose score will be added
    const cursor = await client.db("Quiz-Capstone" ).collection("Student").find({studentEmail: email});
    //Cursor is returned, turn to array and then retrieve the first (and only) elements from the array.
    const allValues = await cursor.toArray();
    if(allValues[0].scores)
    {
        var scores = allValues[0].scores;
        //Create a new score object. The date object is created so that ISO time will be stored in Mongo
        var newScore = {
        quiz: quizName,
        dateTaken: new Date(),
        score: parseFloat(quizScore)}
        scores.push(newScore);
        //Update student with the new array.
        const test = await client.db("Quiz-Capstone").collection("Student").updateOne({studentEmail: email}, {$set: {"scores": scores}});
    
    }
    else {
        var scores = [];
        var newScore = {
            quiz: quizName,
            dateTaken: new Date(),
            score: parseFloat(quizScore)}
            scores.push(newScore);
            //Update student with the new array.
            const test = await client.db("Quiz-Capstone").collection("Student").updateOne({studentEmail: email}, {$set: {"scores": scores}});
    
        
    }
    
}


async function createUserListing(client, newListing) {
    const result = await client
        .db("Quiz-Capstone")
        .collection("Student")
        .insertOne(newListing);

    console.log(
        `New listing created with the following id: ${result.insertedId}`
    );
}

// READ (find listing)
async function findOneDisplayNameByName(client, nameOfEmail) {
    const result = await client
        .db("Quiz-Capstone")
        .collection("Student")
        .findOne({ studentEmail: nameOfEmail });

    if (result) {
        console.log(
            `Found a listing in the collection with the name '${nameOfEmail}'`
        );
        console.log(result);
        return result;
    } else {
        console.log(`No listings found with the name '${nameOfEmail}'`);
        //console.log(result);
        return result;
    }
}

// READ (find listing)
//Find quiz
async function findOneListingByName(client, nameOfListing) {
    const result = await client
        .db("Quiz-Capstone")
        .collection("Quiz")
        .findOne({ quizName: nameOfListing });

    if (result) {
        console.log(
            `Found a listing in the collection with the name '${nameOfListing}'`
        );
        return result;
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}


//Query to find a student info based on email
//This function is used to display a student's past quiz scores
async function findStudent(client, sEmail) {
    const cursor = await client.db("Quiz-Capstone" ).collection("Student").find({studentEmail: sEmail});
    const allValues = await cursor.toArray();
    var scores = allValues[0].scores;
    //Sort scores based on quiz name
    scores.sort(function(a,b) {
        const nameA = a.quiz;
        const nameB = b.quiz;
        if(nameA<nameB){
            return -1;
        }
        if(nameA>nameB){
            return 1;
        }
        return 0;
    });
    console.log(scores);
    
    return scores;
    
}
// calling main and catching for errors if any
main().catch(console.error);

// NODE ROUTES

//Route to create a new score in the database
//Requires user's email, quiz name, and score.
app.get("/newScore", (req, res) => {
    const user_email = req.query.email;
    console.log(user_email);
    const quiz = req.query.quiz;
    const score = req.query.score;
    createScore(client, user_email, quiz, score).then(res.send(""));

})

app.get("/home", (req, res) => {
    res.sendFile(__dirname + "/static/index.html");
});

app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/static/about.html");
});

app.get("/HST01", (req, res) => {
    findOneListingByName(client, "HST01").then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

app.get("/HST02", (req, res) => {
    findOneListingByName(client, "HST02").then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

app.get("/SCI01", (req, res) => {
    findOneListingByName(client, "SCI01").then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

app.get("/CIS02", (req, res) => {
    findOneListingByName(client, "CIS02").then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

app.get("/MEC01", (req, res) => {
    findOneListingByName(client, "MEC01").then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

app.get("/CIS01", (req, res) => {
    findOneListingByName(client, "CIS01").then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

app.get("/MTH01", (req, res) => {
    findOneListingByName(client, "MTH01").then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

app.get("/MTH02", (req, res) => {
    findOneListingByName(client, "MTH02").then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

// Create a user route to create user listing in the database
app.get("/user", (req, res) => {
    const user_email = req.query.email;
    const user_display_name = req.query.displayName;
    // Takes in user email and display name to create a document inside the database.
    createUserListing(client, {
        studentEmail: user_email,
        display_name: user_display_name,
    });
});

// get the user display name
app.get("/userDisplayName", (req, res) => {
    const user_email = req.query.email;
    findOneDisplayNameByName(client, user_email).then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});

//Express route to set up scores table
app.get("/qResults", (req, res) => {
    const user_email = req.query.email;
    console.log(user_email);
    findStudent(client, user_email).then(function(result) {
        res.type("application/json");
        res.send(`${JSON.stringify(result)}`);
    });
});
 
// https request
exports.app = functions.https.onRequest(app);