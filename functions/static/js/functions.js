// // fetching app/mongo route.
// async function fetchMongoData(){
//     const mongoData = await fetch("app/mongo");
//     const responseMongo = await mongoData.text();
//     return responseMongo;
// }

// // call back function from fetchMongoData (necessary for async functions)/
// fetchMongoData().then(function (result) {
//     document.getElementById("mongoData").innerHTML = result;
// });

let btnScience1 = document.getElementById("btnScience1");
let btnScience2 = document.getElementById("btnScience2");
let btnHistory1 = document.getElementById("btnHistory1");
let btnHistory2 = document.getElementById("btnHistory2");
let btnEngineering1 = document.getElementById("btnEngineering1");
let btnEngineering2 = document.getElementById("btnEngineering2");
let btnMath1 = document.getElementById("btnMath1");
let btnMath2 = document.getElementById("btnMath2");
let qBox = document.getElementById("resultBox");

import { dumpSession } from "./authentication.js";

const USER_EMAIL = await dumpSession();

async function addNewScore(email, quiz, score) {
    const myString = "newScore?email=" + email + "&quiz="+quiz+"&score="+score;
    const data = await fetch(myString);
    console.log(data);
}

//Fetch route to display quiz scores
async function fetchQuizData(email) {
    const myString = "qResults?email=" + email;
    const mongoData = await fetch(myString);
    const responseMongo = await mongoData.json();
    return responseMongo;
}

// fetching app/mongo route.
async function fetchHST01() {
    const mongoData = await fetch("HST01");
    const responseMongo = await mongoData.json();
    return responseMongo;
}

// fetching app/mongo route.
async function fetchHST02() {
    const mongoData = await fetch("HST02");
    const responseMongo = await mongoData.json();
    return responseMongo;
}

// fetching app/mongo route.
async function fetchSCI01() {
    const mongoData = await fetch("SCI01");
    const responseMongo = await mongoData.json();
    return responseMongo;
}

// fetching app/mongo route.
async function fetchCIS02() {
    const mongoData = await fetch("CIS02");
    const responseMongo = await mongoData.json();
    return responseMongo;
}

// fetching app/mongo route.
async function fetchMEC01() {
    const mongoData = await fetch("MEC01");
    const responseMongo = await mongoData.json();
    return responseMongo;
}

// fetching app/mongo route.
async function fetchCIS01() {
    const mongoData = await fetch("CIS01");
    const responseMongo = await mongoData.json();
    return responseMongo;
}

// fetching app/mongo route.
async function fetchMTH01() {
    const mongoData = await fetch("MTH01");
    const responseMongo = await mongoData.json();
    return responseMongo;
}

// fetching app/mongo route.
async function fetchMTH02() {
    const mongoData = await fetch("MTH02");
    const responseMongo = await mongoData.json();
    return responseMongo;
}


//Check for existence of a div, if the div exists then there is room to build a scores table.
if (qBox) {
    const userName = await dumpSession();
    if (userName == null) {
        console.log("ERROR");
    } else {
        fetchQuizData(userName).then(function(result) {
            var rTable = document.getElementById("rTable");
            var quizName;
            var quizDate;
            var quizScore;
            //var allScores = result.scores.sort(
            for (let i = 0; i < result.length; i++) {
                quizName = result[i].quiz;
                quizDate = result[i].dateTaken;
                quizDate = quizDate.toString();
                quizDate = quizDate.substr(0, 10);
                quizScore = result[i].score;
                var rRow = document.createElement("tr");
                var item1, item2, item3;
                item1 = document.createElement("td");
                item2 = document.createElement("td");
                item3 = document.createElement("td");

                item1.innerHTML = quizName;
                item2.innerHTML = quizDate;
                item3.innerHTML = quizScore;
                rRow.appendChild(item1);
                rRow.appendChild(item2);
                rRow.appendChild(item3);
                rTable.appendChild(rRow);
            }
        });
    }
}


if (btnHistory1) {
    // call back function from fetchMongoData (necessary for async functions)/
    fetchHST01().then(function(result) {
        btnHistory1.addEventListener("click", function() {
            var modal = document.getElementById("quizModal1");
            var span = document.getElementsByClassName("close")[0];
            let btnConfirm1 = document.getElementById("ok1");
            let btnCancel1 = document.getElementById("cancel1");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            };
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
            btnConfirm1.addEventListener("click", function() {
                let quizPage = window.open("quizPage.html");
                quizPage.addEventListener("DOMContentLoaded", () => {
                    // Now we can access elements on the quiz page
                    quizPage.document.getElementById("quizHeading1").innerHTML =
                        result.category + " - " + result.quizName;
                    var questionCount = Object.keys(result.quizQuestions).length;
                    var quizForm = document.createElement("form");
                    quizForm.id = "quizForm";
                    quizPage.document.getElementById("questions").appendChild(quizForm);
                    for (let i = 0; i < questionCount; i++) {
                        var questionHeading = document.createElement("h4");
                        questionHeading.id = "questionHeading";
                        questionHeading.innerHTML = "Question" + " " + (i + 1);
                        var question = document.createElement("div");
                        question.id = "question" + (i + 1);
                        var newline2 = document.createElement("br");
                        var newline4 = document.createElement("br");
                        var ptag = document.createElement("p");
                        var questionText = document.createTextNode(
                            result.quizQuestions[i].question
                        );
                        ptag.appendChild(questionText);
                        question.appendChild(questionHeading);
                        question.appendChild(newline4);
                        question.appendChild(ptag);
                        question.appendChild(newline2);
                        quizPage.document.getElementById("quizForm").appendChild(question);

                        var optionCount = Object.keys(
                            result.quizQuestions[i].options
                        ).length;
                        var options = document.createElement("div");
                        options.id = "question" + (i + 1) + "Options";
                        for (let j = 0; j < optionCount; j++) {
                            var radiobox = document.createElement("input");
                            radiobox.type = "radio";
                            radiobox.id = "q" + (i + 1) + "Option" + (j + 1);
                            radiobox.name = "q" + (i + 1) + "Options";
                            radiobox.value= result.quizQuestions[i].options[j];

                            var label = document.createElement("label");
                            label.htmlFor = "q" + (i + 1) + "Option" + (j + 1);

                            var option = document.createTextNode(
                                " " + result.quizQuestions[i].options[j]
                            );
                            label.appendChild(option);

                            var newline = document.createElement("br");
                            var newline3 = document.createElement("br");

                            options.appendChild(radiobox);
                            options.appendChild(label);
                            options.appendChild(newline);
                            options.appendChild(newline3);

                            quizPage.document
                                .getElementById("question" + (i + 1))
                                .appendChild(options);
                        }
                    }
                    var sbDiv = document.createElement("div");
                    sbDiv.id = "submit_button";
                    var submitButton = document.createElement("button");
                    submitButton.innerHTML = "Submit";
                    submitButton.id ="btnSubmit";
                    submitButton.type = "button";
                    sbDiv.appendChild(submitButton);
                    quizPage.document.getElementById("quizForm").appendChild(sbDiv);

                    //this section handles the submit event handler
                    quizPage.document.querySelector("#btnSubmit").addEventListener("click", function(){
                        
                        let quizResults = window.open("quizTestResults.html");
                        quizResults.addEventListener("DOMContentLoaded", () => {
                        //find which buttons are selected    
                        var answer =[] ;
                        for (let i =0; i< questionCount; i++){
                            var radio = quizPage.document.getElementsByName("q" + (i+1) + "Options");
                            for(let i = 0; i < radio.length; i++){
                                if (radio[i].checked){
                                answer.push(radio[i].value);
                                }     
                            }
                        
                        }
                        //get score
                        var score = getScore(answer, result);
                        var pointsArray = getPointsPerQuestion(answer, result);
                        


                        //this section dynamically creats first questionblock for heading and total score on the results page
                        var questionBlock = document.createElement("div");
                        questionBlock.id= "questionBlock";


                        var quizName = document.createElement("h3");
                        quizName.id = "quizName";
                        quizName.innerHTML = result.quizName + " Quiz";
                        var totalPoints = document.createElement("section");
                        totalPoints.id= "totalPoints";
                        
                        totalPoints.innerHTML = score;

                        questionBlock.appendChild(quizName);
                        questionBlock.appendChild(totalPoints);

                        quizResults.document.getElementById("resultBox").appendChild(questionBlock);



                        //dynamicallly create questionBlocks for each question 
                        for(let i= 0; i<questionCount; i++){
                            

                            //create questionblock
                            var questionBlock = document.createElement("div");
                            questionBlock.id = "questionBlock";
                            

                            var question = document.createElement("p");
                            question.innerHTML = "Question " + (i+1) + ":" + result.quizQuestions[i].question;
                        


                            var userAnswer = document.createElement("p");
                            userAnswer.id = "userAnswer";
                            userAnswer.innerHTML= "Your Answer: " + answer[i];
                            

                            var points =document.createElement("div");
                            points.id = "points";
                            points.innerHTML = pointsArray[i];
                            

                            questionBlock.appendChild(question);
                            questionBlock.appendChild(userAnswer);
                            questionBlock.appendChild(points);

                            quizResults.document.getElementById("resultBox").appendChild(questionBlock);

                        }

                        //add score to database
                        addNewScore(USER_EMAIL, result.quizName, score);
                    });
                    quizPage.close();
                                    });
                });

                modal.style.display = "none";
            });
            btnCancel1.addEventListener("click", function() {
                modal.style.display = "none";
            });
        });
    });
}

if (btnHistory2) {
    // call back function from fetchMongoData (necessary for async functions)/
    fetchHST02().then(function(result) {
        btnHistory2.addEventListener("click", function() {
            var modal = document.getElementById("quizModal2");
            var span = document.getElementsByClassName("close")[0];
            let btnConfirm1 = document.getElementById("ok2");
            let btnCancel1 = document.getElementById("cancel2");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            };
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
            btnConfirm1.addEventListener("click", function() {
                let quizPage = window.open("quizPage.html");
                quizPage.addEventListener("DOMContentLoaded", () => {
                    // Now we can access elements on the quiz page
                    quizPage.document.getElementById("quizHeading1").innerHTML =
                        result.category + " - " + result.quizName;
                    var questionCount = Object.keys(result.quizQuestions).length;
                    var quizForm = document.createElement("form");
                    quizForm.id = "quizForm";
                    quizPage.document.getElementById("questions").appendChild(quizForm);
                    for (let i = 0; i < questionCount; i++) {
                        var questionHeading = document.createElement("h4");
                        questionHeading.id = "questionHeading";
                        questionHeading.innerHTML = "Question" + " " + (i + 1);
                        var question = document.createElement("div");
                        question.id = "question" + (i + 1);
                        var newline2 = document.createElement("br");
                        var newline4 = document.createElement("br");
                        var ptag = document.createElement("p");
                        var questionText = document.createTextNode(
                            result.quizQuestions[i].question
                        );
                        ptag.appendChild(questionText);
                        question.appendChild(questionHeading);
                        question.appendChild(newline4);
                        question.appendChild(ptag);
                        question.appendChild(newline2);
                        quizPage.document.getElementById("quizForm").appendChild(question);

                        var optionCount = Object.keys(
                            result.quizQuestions[i].options
                        ).length;
                        var options = document.createElement("div");
                        options.id = "question" + (i + 1) + "Options";
                        for (let j = 0; j < optionCount; j++) {
                            var radiobox = document.createElement("input");
                            radiobox.type = "radio";
                            radiobox.id = "q" + (i + 1) + "Option" + (j + 1);
                            radiobox.name = "q" + (i + 1) + "Options";
                            radiobox.value= result.quizQuestions[i].options[j];

                            var label = document.createElement("label");
                            label.htmlFor = "q" + (i + 1) + "Option" + (j + 1);

                            var option = document.createTextNode(
                                " " + result.quizQuestions[i].options[j]
                            );
                            label.appendChild(option);

                            var newline = document.createElement("br");
                            var newline3 = document.createElement("br");

                            options.appendChild(radiobox);
                            options.appendChild(label);
                            options.appendChild(newline);
                            options.appendChild(newline3);

                            quizPage.document
                                .getElementById("question" + (i + 1))
                                .appendChild(options);
                        }
                    }
                    var sbDiv = document.createElement("div");
                    sbDiv.id = "submit_button";
                    var submitButton = document.createElement("button");
                    submitButton.innerHTML = "Submit";
                    submitButton.id ="btnSubmit";
                    submitButton.type = "button";
                    sbDiv.appendChild(submitButton);
                    quizPage.document.getElementById("quizForm").appendChild(sbDiv);

                        //this section handles the submit event handler
                        quizPage.document.querySelector("#btnSubmit").addEventListener("click", function(){
                            
                            let quizResults = window.open("quizTestResults.html");
                            quizResults.addEventListener("DOMContentLoaded", () => {
                            //find which buttons are selected    
                            var answer =[] ;
                            for (let i =0; i< questionCount; i++){
                                var radio = quizPage.document.getElementsByName("q" + (i+1) + "Options");
                                for(let i = 0; i < radio.length; i++){
                                    if (radio[i].checked){
                                    answer.push(radio[i].value);
                                    }     
                                }
                            
                            }
                            //get score
                            var score = getScore(answer, result);
                            var pointsArray = getPointsPerQuestion(answer, result);
                            


                            //this section dynamically creats first questionblock for heading and total score on the results page
                            var questionBlock = document.createElement("div");
                            questionBlock.id= "questionBlock";


                            var quizName = document.createElement("h3");
                            quizName.id = "quizName";
                            quizName.innerHTML = result.quizName + " Quiz";
                            var totalPoints = document.createElement("section");
                            totalPoints.id= "totalPoints";
                            
                            totalPoints.innerHTML = score;

                            questionBlock.appendChild(quizName);
                            questionBlock.appendChild(totalPoints);

                            quizResults.document.getElementById("resultBox").appendChild(questionBlock);



                            //dynamicallly create questionBlocks for each question 
                            for(let i= 0; i<questionCount; i++){
                                

                                //create questionblock
                                var questionBlock = document.createElement("div");
                                questionBlock.id = "questionBlock";
                                

                                var question = document.createElement("p");
                                question.innerHTML = "Question " + (i+1) + ":" + result.quizQuestions[i].question;
                            


                                var userAnswer = document.createElement("p");
                                userAnswer.id = "userAnswer";
                                userAnswer.innerHTML= "Your Answer: " + answer[i];
                                

                                var points =document.createElement("div");
                                points.id = "points";
                                points.innerHTML = pointsArray[i];
                                

                                questionBlock.appendChild(question);
                                questionBlock.appendChild(userAnswer);
                                questionBlock.appendChild(points);

                                quizResults.document.getElementById("resultBox").appendChild(questionBlock);

                            }

                            //add score to database
                            addNewScore(USER_EMAIL, result.quizName, score);
                        });
                        quizPage.close();
                                        });
                });
                modal.style.display = "none";
            });
            btnCancel1.addEventListener("click", function() {
                modal.style.display = "none";
            });
        });
    });
}

if (btnScience1) {
    // call back function from fetchMongoData (necessary for async functions)/
    fetchSCI01().then(function(result) {
        btnScience1.addEventListener("click", function() {
            var modal = document.getElementById("quizModal1");
            var span = document.getElementsByClassName("close")[0];
            let btnConfirm1 = document.getElementById("ok1");
            let btnCancel1 = document.getElementById("cancel1");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            };
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
            btnConfirm1.addEventListener("click", function() {
                let quizPage = window.open("quizPage.html");
                quizPage.addEventListener("DOMContentLoaded", () => {
                    // Now we can access elements on the quiz page
                    quizPage.document.getElementById("quizHeading1").innerHTML =
                        result.category + " - " + result.quizName;
                    var questionCount = Object.keys(result.quizQuestions).length;
                    var quizForm = document.createElement("form");
                    quizForm.id = "quizForm";
                    quizPage.document.getElementById("questions").appendChild(quizForm);
                    for (let i = 0; i < questionCount; i++) {
                        var questionHeading = document.createElement("h4");
                        questionHeading.id = "questionHeading";
                        questionHeading.innerHTML = "Question" + " " + (i + 1);
                        var question = document.createElement("div");
                        question.id = "question" + (i + 1);
                        var newline2 = document.createElement("br");
                        var newline4 = document.createElement("br");
                        var ptag = document.createElement("p");
                        var questionText = document.createTextNode(
                            result.quizQuestions[i].question
                        );
                        ptag.appendChild(questionText);
                        question.appendChild(questionHeading);
                        question.appendChild(newline4);
                        question.appendChild(ptag);
                        question.appendChild(newline2);
                        quizPage.document.getElementById("quizForm").appendChild(question);

                        var optionCount = Object.keys(
                            result.quizQuestions[i].options
                        ).length;
                        var options = document.createElement("div");
                        options.id = "question" + (i + 1) + "Options";
                        for (let j = 0; j < optionCount; j++) {
                            var radiobox = document.createElement("input");
                            radiobox.type = "radio";
                            radiobox.id = "q" + (i + 1) + "Option" + (j + 1);
                            radiobox.name = "q" + (i + 1) + "Options";
                            radiobox.value= result.quizQuestions[i].options[j];

                            var label = document.createElement("label");
                            label.htmlFor = "q" + (i + 1) + "Option" + (j + 1);

                            var option = document.createTextNode(
                                " " + result.quizQuestions[i].options[j]
                            );
                            label.appendChild(option);

                            var newline = document.createElement("br");
                            var newline3 = document.createElement("br");

                            options.appendChild(radiobox);
                            options.appendChild(label);
                            options.appendChild(newline);
                            options.appendChild(newline3);

                            quizPage.document
                                .getElementById("question" + (i + 1))
                                .appendChild(options);
                        }
                    }
                    var sbDiv = document.createElement("div");
                    sbDiv.id = "submit_button";
                    var submitButton = document.createElement("button");
                    submitButton.innerHTML = "Submit";
                    submitButton.id ="btnSubmit";
                    submitButton.type = "button";
                    sbDiv.appendChild(submitButton);
                    quizPage.document.getElementById("quizForm").appendChild(sbDiv);

                      //this section handles the submit event handler
                      quizPage.document.querySelector("#btnSubmit").addEventListener("click", function(){
        
                        let quizResults = window.open("quizTestResults.html");
                        quizResults.addEventListener("DOMContentLoaded", () => {
                        //find which buttons are selected    
                        var answer =[] ;
                        for (let i =0; i< questionCount; i++){
                            var radio = quizPage.document.getElementsByName("q" + (i+1) + "Options");
                            for(let i = 0; i < radio.length; i++){
                                if (radio[i].checked){
                                answer.push(radio[i].value);
                                }     
                            }
                        
                         }
                        //get score
                         var score = getScore(answer, result);
                         var pointsArray = getPointsPerQuestion(answer, result);
                        


                         //this section dynamically creats first questionblock for heading and total score on the results page
                        var questionBlock = document.createElement("div");
                        questionBlock.id= "questionBlock";


                        var quizName = document.createElement("h3");
                        quizName.id = "quizName";
                        quizName.innerHTML = result.quizName + " Quiz";
                        var totalPoints = document.createElement("section");
                        totalPoints.id= "totalPoints";
                        
                         totalPoints.innerHTML = score;

                        questionBlock.appendChild(quizName);
                        questionBlock.appendChild(totalPoints);

                        quizResults.document.getElementById("resultBox").appendChild(questionBlock);



                         //dynamicallly create questionBlocks for each question 
                        for(let i= 0; i<questionCount; i++){
                            

                            //create questionblock
                            var questionBlock = document.createElement("div");
                            questionBlock.id = "questionBlock";
                            

                            var question = document.createElement("p");
                            question.innerHTML = "Question " + (i+1) + ":" + result.quizQuestions[i].question;
                           


                            var userAnswer = document.createElement("p");
                            userAnswer.id = "userAnswer";
                            userAnswer.innerHTML= "Your Answer: " + answer[i];
                            

                            var points =document.createElement("div");
                            points.id = "points";
                            points.innerHTML = pointsArray[i];
                            

                            questionBlock.appendChild(question);
                            questionBlock.appendChild(userAnswer);
                            questionBlock.appendChild(points);

                            quizResults.document.getElementById("resultBox").appendChild(questionBlock);

                        }

                        //add score to database
                         addNewScore(USER_EMAIL, result.quizName, score);
                    });
                    quizPage.close();

                });
                modal.style.display = "none";
            });
            btnCancel1.addEventListener("click", function() {
                modal.style.display = "none";
            });
        });
    });
});
}
if (btnScience2) {
    // call back function from fetchMongoData (necessary for async functions)/
    fetchCIS02().then(function(result) {
        btnScience2.addEventListener("click", function() {
            var modal = document.getElementById("quizModal2");
            var span = document.getElementsByClassName("close")[0];
            let btnConfirm = document.getElementById("ok2");
            let btnCancel = document.getElementById("cancel2");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            };
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
            btnConfirm.addEventListener("click", function() {
                let quizPage = window.open("quizPage.html");
                quizPage.addEventListener("DOMContentLoaded", () => {
                    // Now we can access elements on the quiz page
                    quizPage.document.getElementById("quizHeading1").innerHTML =
                        result.category + " - " + result.quizName;
                    var questionCount = Object.keys(result.quizQuestions).length;
                    var quizForm = document.createElement("form");
                    quizForm.id = "quizForm";
                    quizPage.document.getElementById("questions").appendChild(quizForm);
                    for (let i = 0; i < questionCount; i++) {
                        var questionHeading = document.createElement("h4");
                        questionHeading.id = "questionHeading";
                        questionHeading.innerHTML = "Question" + " " + (i + 1);
                        var question = document.createElement("div");
                        question.id = "question" + (i + 1);
                        var newline2 = document.createElement("br");
                        var newline4 = document.createElement("br");
                        var ptag = document.createElement("p");
                        var questionText = document.createTextNode(
                            result.quizQuestions[i].question
                        );
                        ptag.appendChild(questionText);
                        question.appendChild(questionHeading);
                        question.appendChild(newline4);
                        question.appendChild(ptag);
                        question.appendChild(newline2);
                        quizPage.document.getElementById("quizForm").appendChild(question);

                        var optionCount = Object.keys(
                            result.quizQuestions[i].options
                        ).length;
                        var options = document.createElement("div");
                        options.id = "question" + (i + 1) + "Options";
                        for (let j = 0; j < optionCount; j++) {
                            var radiobox = document.createElement("input");
                            radiobox.type = "radio";
                            radiobox.id = "q" + (i + 1) + "Option" + (j + 1);
                            radiobox.name = "q" + (i + 1) + "Options";
                            radiobox.value= result.quizQuestions[i].options[j];

                            var label = document.createElement("label");
                            label.htmlFor = "q" + (i + 1) + "Option" + (j + 1);

                            var option = document.createTextNode(
                                " " + result.quizQuestions[i].options[j]
                            );
                            label.appendChild(option);

                            var newline = document.createElement("br");
                            var newline3 = document.createElement("br");

                            options.appendChild(radiobox);
                            options.appendChild(label);
                            options.appendChild(newline);
                            options.appendChild(newline3);

                            quizPage.document
                                .getElementById("question" + (i + 1))
                                .appendChild(options);
                        }
                    }
                    var sbDiv = document.createElement("div");
                    sbDiv.id = "submit_button";
                    var submitButton = document.createElement("button");
                    submitButton.innerHTML = "Submit";
                    submitButton.id ="btnSubmit";
                    submitButton.type = "button";
                    sbDiv.appendChild(submitButton);
                    quizPage.document.getElementById("quizForm").appendChild(sbDiv);

                //this section handles the submit event handler
                quizPage.document.querySelector("#btnSubmit").addEventListener("click", function(){
                    
                    let quizResults = window.open("quizTestResults.html");
                    quizResults.addEventListener("DOMContentLoaded", () => {
                    //find which buttons are selected    
                    var answer =[] ;
                    for (let i =0; i< questionCount; i++){
                        var radio = quizPage.document.getElementsByName("q" + (i+1) + "Options");
                        for(let i = 0; i < radio.length; i++){
                            if (radio[i].checked){
                            answer.push(radio[i].value);
                            }     
                        }
                    
                    }
                    //get score
                    var score = getScore(answer, result);
                    var pointsArray = getPointsPerQuestion(answer, result);
                    


                    //this section dynamically creats first questionblock for heading and total score on the results page
                    var questionBlock = document.createElement("div");
                    questionBlock.id= "questionBlock";


                    var quizName = document.createElement("h3");
                    quizName.id = "quizName";
                    quizName.innerHTML = result.quizName + " Quiz";
                    var totalPoints = document.createElement("section");
                    totalPoints.id= "totalPoints";
                    
                    totalPoints.innerHTML = score;

                    questionBlock.appendChild(quizName);
                    questionBlock.appendChild(totalPoints);

                    quizResults.document.getElementById("resultBox").appendChild(questionBlock);



                    //dynamicallly create questionBlocks for each question 
                    for(let i= 0; i<questionCount; i++){
                        

                        //create questionblock
                        var questionBlock = document.createElement("div");
                        questionBlock.id = "questionBlock";
                        

                        var question = document.createElement("p");
                        question.innerHTML = "Question " + (i+1) + ":" + result.quizQuestions[i].question;
                    


                        var userAnswer = document.createElement("p");
                        userAnswer.id = "userAnswer";
                        userAnswer.innerHTML= "Your Answer: " + answer[i];
                        

                        var points =document.createElement("div");
                        points.id = "points";
                        points.innerHTML = pointsArray[i];
                        

                        questionBlock.appendChild(question);
                        questionBlock.appendChild(userAnswer);
                        questionBlock.appendChild(points);

                        quizResults.document.getElementById("resultBox").appendChild(questionBlock);

                    }

                    //add score to database
                    addNewScore(USER_EMAIL, result.quizName, score);
                });
                quizPage.close();
                });
                modal.style.display = "none";
            });
            btnCancel.addEventListener("click", function() {
                modal.style.display = "none";
            });
        });
    });
});
}

if (btnEngineering2) {
    // call back function from fetchMongoData (necessary for async functions)/
    fetchCIS01().then(function(result) {
        btnEngineering2.addEventListener("click", function() {
            var modal = document.getElementById("quizModal2");
            var span = document.getElementsByClassName("close")[0];
            let btnConfirm2 = document.getElementById("ok2");
            let btnCancel2 = document.getElementById("cancel2");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            };
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
            btnConfirm2.addEventListener("click", function() {
                let quizPage = window.open("quizPage.html");
                quizPage.addEventListener("DOMContentLoaded", () => {
                    // Now we can access elements on the quiz page
                    quizPage.document.getElementById("quizHeading1").innerHTML =
                        result.category + " - " + result.quizName;
                    var questionCount = Object.keys(result.quizQuestions).length;
                    var quizForm = document.createElement("form");
                    quizForm.id = "quizForm";
                    quizPage.document.getElementById("questions").appendChild(quizForm);
                    for (let i = 0; i < questionCount; i++) {
                        var questionHeading = document.createElement("h4");
                        questionHeading.id = "questionHeading";
                        questionHeading.innerHTML = "Question" + " " + (i + 1);
                        var question = document.createElement("div");
                        question.id = "question" + (i + 1);
                        var newline2 = document.createElement("br");
                        var newline4 = document.createElement("br");
                        var ptag = document.createElement("p");
                        var questionText = document.createTextNode(
                            result.quizQuestions[i].question
                        );
                        ptag.appendChild(questionText);
                        question.appendChild(questionHeading);
                        question.appendChild(newline4);
                        question.appendChild(ptag);
                        question.appendChild(newline2);
                        quizPage.document.getElementById("quizForm").appendChild(question);

                        var optionCount = Object.keys(
                            result.quizQuestions[i].options
                        ).length;
                        var options = document.createElement("div");
                        options.id = "question" + (i + 1) + "Options";
                        for (let j = 0; j < optionCount; j++) {
                            var radiobox = document.createElement("input");
                            radiobox.type = "radio";
                            radiobox.id = "q" + (i + 1) + "Option" + (j + 1);
                            radiobox.name = "q" + (i + 1) + "Options";
                            radiobox.value= result.quizQuestions[i].options[j];

                            var label = document.createElement("label");
                            label.htmlFor = "q" + (i + 1) + "Option" + (j + 1);

                            var option = document.createTextNode(
                                " " + result.quizQuestions[i].options[j]
                            );
                            label.appendChild(option);

                            var newline = document.createElement("br");
                            var newline3 = document.createElement("br");

                            options.appendChild(radiobox);
                            options.appendChild(label);
                            options.appendChild(newline);
                            options.appendChild(newline3);

                            quizPage.document
                                .getElementById("question" + (i + 1))
                                .appendChild(options);
                        }
                    }
                    var sbDiv = document.createElement("div");
                    sbDiv.id = "submit_button";
                    var submitButton = document.createElement("button");
                    submitButton.innerHTML = "Submit";
                    submitButton.id ="btnSubmit";
                    submitButton.type = "button";
                    sbDiv.appendChild(submitButton);
                    quizPage.document.getElementById("quizForm").appendChild(sbDiv);

                        //this section handles the submit event handler
                        quizPage.document.querySelector("#btnSubmit").addEventListener("click", function(){
                            
                            let quizResults = window.open("quizTestResults.html");
                            quizResults.addEventListener("DOMContentLoaded", () => {
                            //find which buttons are selected    
                            var answer =[] ;
                            for (let i =0; i< questionCount; i++){
                                var radio = quizPage.document.getElementsByName("q" + (i+1) + "Options");
                                for(let i = 0; i < radio.length; i++){
                                    if (radio[i].checked){
                                    answer.push(radio[i].value);
                                    }     
                                }
                            
                            }
                            //get score
                            var score = getScore(answer, result);
                            var pointsArray = getPointsPerQuestion(answer, result);
                            


                            //this section dynamically creats first questionblock for heading and total score on the results page
                            var questionBlock = document.createElement("div");
                            questionBlock.id= "questionBlock";


                            var quizName = document.createElement("h3");
                            quizName.id = "quizName";
                            quizName.innerHTML = result.quizName + " Quiz";
                            var totalPoints = document.createElement("section");
                            totalPoints.id= "totalPoints";
                            
                            totalPoints.innerHTML = score;

                            questionBlock.appendChild(quizName);
                            questionBlock.appendChild(totalPoints);

                            quizResults.document.getElementById("resultBox").appendChild(questionBlock);



                            //dynamicallly create questionBlocks for each question 
                            for(let i= 0; i<questionCount; i++){
                                

                                //create questionblock
                                var questionBlock = document.createElement("div");
                                questionBlock.id = "questionBlock";
                                

                                var question = document.createElement("p");
                                question.innerHTML = "Question " + (i+1) + ":" + result.quizQuestions[i].question;
                            


                                var userAnswer = document.createElement("p");
                                userAnswer.id = "userAnswer";
                                userAnswer.innerHTML= "Your Answer: " + answer[i];
                                

                                var points =document.createElement("div");
                                points.id = "points";
                                points.innerHTML = pointsArray[i];
                                

                                questionBlock.appendChild(question);
                                questionBlock.appendChild(userAnswer);
                                questionBlock.appendChild(points);

                                quizResults.document.getElementById("resultBox").appendChild(questionBlock);

                            }

                            //add score to database
                            addNewScore(USER_EMAIL, result.quizName, score);
                        });
                     quizPage.close();              
                });
                modal.style.display = "none";
            });
            btnCancel2.addEventListener("click", function() {
                modal.style.display = "none";
            });
        });
    });
});
}

if (btnMath1) {
    // call back function from fetchMongoData (necessary for async functions)/
    fetchMTH01().then(function(result) {
        btnMath1.addEventListener("click", function() {
            var modal = document.getElementById("quizModal1");
            var span = document.getElementsByClassName("close")[0];
            let btnConfirm1 = document.getElementById("ok1");
            let btnCancel1 = document.getElementById("cancel1");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            };
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
            btnConfirm1.addEventListener("click", function() {
                let quizPage = window.open("quizPage.html");
                quizPage.addEventListener("DOMContentLoaded", () => {
                    // Now we can access elements on the quiz page
                    quizPage.document.getElementById("quizHeading1").innerHTML =
                        result.category + " - " + result.quizName;
                    var questionCount = Object.keys(result.quizQuestions).length;
                    var quizForm = document.createElement("form");
                    quizForm.id = "quizForm";
                    quizPage.document.getElementById("questions").appendChild(quizForm);
                    for (let i = 0; i < questionCount; i++) {
                        var questionHeading = document.createElement("h4");
                        questionHeading.id = "questionHeading";
                        questionHeading.innerHTML = "Question" + " " + (i + 1);
                        var question = document.createElement("div");
                        question.id = "question" + (i + 1);
                        var newline2 = document.createElement("br");
                        var newline4 = document.createElement("br");
                        var ptag = document.createElement("p");
                        var questionText = document.createTextNode(
                            result.quizQuestions[i].question
                        );
                        ptag.appendChild(questionText);
                        question.appendChild(questionHeading);
                        question.appendChild(newline4);
                        question.appendChild(ptag);
                        question.appendChild(newline2);
                        quizPage.document.getElementById("quizForm").appendChild(question);

                        var optionCount = Object.keys(
                            result.quizQuestions[i].options
                        ).length;
                        var options = document.createElement("div");
                        options.id = "question" + (i + 1) + "Options";
                        for (let j = 0; j < optionCount; j++) {
                            var radiobox = document.createElement("input");
                            radiobox.type = "radio";
                            radiobox.id = "q" + (i + 1) + "Option" + (j + 1);
                            radiobox.name = "q" + (i + 1) + "Options";
                            radiobox.value= result.quizQuestions[i].options[j];

                            var label = document.createElement("label");
                            label.htmlFor = "q" + (i + 1) + "Option" + (j + 1);

                            var option = document.createTextNode(
                                " " + result.quizQuestions[i].options[j]
                            );
                            label.appendChild(option);

                            var newline = document.createElement("br");
                            var newline3 = document.createElement("br");

                            options.appendChild(radiobox);
                            options.appendChild(label);
                            options.appendChild(newline);
                            options.appendChild(newline3);

                            quizPage.document
                                .getElementById("question" + (i + 1))
                                .appendChild(options);
                        }
                    }
                    var sbDiv = document.createElement("div");
                    sbDiv.id = "submit_button";
                    var submitButton = document.createElement("button");
                    submitButton.innerHTML = "Submit";
                    submitButton.id ="btnSubmit";
                    submitButton.type = "button";
                    sbDiv.appendChild(submitButton);
                    quizPage.document.getElementById("quizForm").appendChild(sbDiv);

     //this section handles the submit event handler
                    quizPage.document.querySelector("#btnSubmit").addEventListener("click", function(){
        
                        let quizResults = window.open("quizTestResults.html");
                        quizResults.addEventListener("DOMContentLoaded", () => {
                        //find which buttons are selected    
                        var answer =[] ;
                        for (let i =0; i< questionCount; i++){
                            var radio = quizPage.document.getElementsByName("q" + (i+1) + "Options");
                            for(let i = 0; i < radio.length; i++){
                                if (radio[i].checked){
                                answer.push(radio[i].value);
                                }     
                            }
                        
                         }
                        //get score
                         var score = getScore(answer, result);
                         var pointsArray = getPointsPerQuestion(answer, result);
                        


                         //this section dynamically creats first questionblock for heading and total score on the results page
                        var questionBlock = document.createElement("div");
                        questionBlock.id= "questionBlock";


                        var quizName = document.createElement("h3");
                        quizName.id = "quizName";
                        quizName.innerHTML = result.quizName + " Quiz";
                        var totalPoints = document.createElement("section");
                        totalPoints.id= "totalPoints";
                        
                         totalPoints.innerHTML = score;

                        questionBlock.appendChild(quizName);
                        questionBlock.appendChild(totalPoints);

                        quizResults.document.getElementById("resultBox").appendChild(questionBlock);



                         //dynamicallly create questionBlocks for each question 
                        for(let i= 0; i<questionCount; i++){
                            

                            //create questionblock
                            var questionBlock = document.createElement("div");
                            questionBlock.id = "questionBlock";
                            

                            var question = document.createElement("p");
                            question.innerHTML = "Question " + (i+1) + ":" + result.quizQuestions[i].question;
                           


                            var userAnswer = document.createElement("p");
                            userAnswer.id = "userAnswer";
                            userAnswer.innerHTML= "Your Answer: " + answer[i];
                            

                            var points =document.createElement("div");
                            points.id = "points";
                            points.innerHTML = pointsArray[i];
                            

                            questionBlock.appendChild(question);
                            questionBlock.appendChild(userAnswer);
                            questionBlock.appendChild(points);

                            quizResults.document.getElementById("resultBox").appendChild(questionBlock);

                        }

                        //add score to database
                         addNewScore(USER_EMAIL, result.quizName, score);
                    });
                    quizPage.close();
                });
                modal.style.display = "none";
            });
            btnCancel1.addEventListener("click", function() {
                modal.style.display = "none";
            });
        });
    });
});
}
if (btnMath2) {
    // call back function from fetchMongoData (necessary for async functions)/
    fetchMTH02().then(function(result) {
        btnMath2.addEventListener("click", function() {
            var modal = document.getElementById("quizModal2");
            var span = document.getElementsByClassName("close")[0];
            let btnConfirm2 = document.getElementById("ok2");
            let btnCancel2 = document.getElementById("cancel2");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            };
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
            btnConfirm2.addEventListener("click", function() {
                let quizPage = window.open("quizPage.html");
                quizPage.addEventListener("DOMContentLoaded", () => {
                    // Now we can access elements on the quiz page
                    quizPage.document.getElementById("quizHeading1").innerHTML =
                        result.category + " - " + result.quizName;
                    var questionCount = Object.keys(result.quizQuestions).length;
                    var quizForm = document.createElement("form");
                    quizForm.id = "quizForm";
                    quizPage.document.getElementById("questions").appendChild(quizForm);
                    for (let i = 0; i < questionCount; i++) {
                        var questionHeading = document.createElement("h4");
                        questionHeading.id = "questionHeading";
                        questionHeading.innerHTML = "Question" + " " + (i + 1);
                        var question = document.createElement("div");
                        question.id = "question" + (i + 1);
                        var newline2 = document.createElement("br");
                        var newline4 = document.createElement("br");
                        var ptag = document.createElement("p");
                        var questionText = document.createTextNode(
                            result.quizQuestions[i].question
                        );
                        ptag.appendChild(questionText);
                        question.appendChild(questionHeading);
                        question.appendChild(newline4);
                        question.appendChild(ptag);
                        question.appendChild(newline2);
                        
                        //This section checks to see if a picture is associated with
                        //a question. At the time of this comment (04/29/2022)
                        //this code only appears for Math Quiz 2. 
                        var qPic = result.quizQuestions[i].quizPic;
                        if(qPic){
                            var picTag = document.createElement("img");
                            picTag.alt = "question picture";
                        
                            picTag.src = qPic;
                            question.appendChild(picTag);
                        }
                        //End picture checking/retrieving code
                        
                        quizPage.document.getElementById("quizForm").appendChild(question);

                        var optionCount = Object.keys(
                            result.quizQuestions[i].options
                        ).length;
                        var options = document.createElement("div");
                        options.id = "question" + (i + 1) + "Options";
                        for (let j = 0; j < optionCount; j++) {
                            var radiobox = document.createElement("input");
                            radiobox.type = "radio";
                            radiobox.id = "q" + (i + 1) + "Option" + (j + 1);
                            radiobox.name = "q" + (i + 1) + "Options";
                            //radiobox.value = i + 1;
                            //this sets value of radio box to the option
                            radiobox.value= result.quizQuestions[i].options[j];
                            var label = document.createElement("label");
                            label.htmlFor = "q" + (i + 1) + "Option" + (j + 1);

                            var option = document.createTextNode(
                                " " + result.quizQuestions[i].options[j]
                            );
                            label.appendChild(option);

                            var newline = document.createElement("br");
                            var newline3 = document.createElement("br");

                            options.appendChild(radiobox);
                            options.appendChild(label);
                            options.appendChild(newline);
                            options.appendChild(newline3);

                            quizPage.document
                                .getElementById("question" + (i + 1))
                                .appendChild(options);
                        }
                    }
                    var sbDiv = document.createElement("div");
                    sbDiv.id = "submit_button";
                    var submitButton = document.createElement("button");
                    submitButton.innerHTML = "Submit";
                    submitButton.id ="btnSubmit";
                    submitButton.type = "button";
                    sbDiv.appendChild(submitButton);
                    quizPage.document.getElementById("quizForm").appendChild(sbDiv);

                    //this section handles the submit event handler
                    quizPage.document.querySelector("#btnSubmit").addEventListener("click", function(){
        
                        let quizResults = window.open("quizTestResults.html");
                        quizResults.addEventListener("DOMContentLoaded", () => {
                        //find which buttons are selected    
                        var answer =[] ;
                        for (let i =0; i< questionCount; i++){
                            var radio = quizPage.document.getElementsByName("q" + (i+1) + "Options");
                            for(let i = 0; i < radio.length; i++){
                                if (radio[i].checked){
                                answer.push(radio[i].value);
                                }     
                            }
                        
                         }
                        //get score
                         var score = getScore(answer, result);
                         var pointsArray = getPointsPerQuestion(answer, result);
                        


                         //this section dynamically creats first questionblock for heading and total score on the results page
                        var questionBlock = document.createElement("div");
                        questionBlock.id= "questionBlock";


                        var quizName = document.createElement("h3");
                        quizName.id = "quizName";
                        quizName.innerHTML = result.quizName + " Quiz";
                        var totalPoints = document.createElement("section");
                        totalPoints.id= "totalPoints";
                        
                         totalPoints.innerHTML = score;

                        questionBlock.appendChild(quizName);
                        questionBlock.appendChild(totalPoints);

                        quizResults.document.getElementById("resultBox").appendChild(questionBlock);



                         //dynamicallly create questionBlocks for each question 
                        for(let i= 0; i<questionCount; i++){
                            

                            //create questionblock
                            var questionBlock = document.createElement("div");
                            questionBlock.id = "questionBlock";
                            

                            var question = document.createElement("p");
                            question.innerHTML = "Question " + (i+1) + ":" + result.quizQuestions[i].question;
                           


                            var userAnswer = document.createElement("p");
                            userAnswer.id = "userAnswer";
                            userAnswer.innerHTML= "Your Answer: " + answer[i];
                            

                            var points =document.createElement("div");
                            points.id = "points";
                            points.innerHTML = pointsArray[i];
                            

                            questionBlock.appendChild(question);
                            questionBlock.appendChild(userAnswer);
                            questionBlock.appendChild(points);

                            quizResults.document.getElementById("resultBox").appendChild(questionBlock);

                        }

                        //add score to database
                         addNewScore(USER_EMAIL, result.quizName, score);
                    });
                    quizPage.close();
                    });
                    
                });
                modal.style.display = "none";
            });
            btnCancel2.addEventListener("click", function() {
                modal.style.display = "none";
            });
        });
    });
}
if (btnEngineering1) {
    // call back function from fetchMongoData (necessary for async functions)/
    fetchMEC01().then(function(result) {
        btnEngineering1.addEventListener("click", function() {
            var modal = document.getElementById("quizModal1");
            var span = document.getElementsByClassName("close")[0];
            let btnConfirm1 = document.getElementById("ok1");
            let btnCancel1 = document.getElementById("cancel1");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            };
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            };
            btnConfirm1.addEventListener("click", function() {
                let quizPage = window.open("quizPage.html");
                quizPage.addEventListener("DOMContentLoaded", () => {
                    // Now we can access elements on the quiz page
                    quizPage.document.getElementById("quizHeading1").innerHTML =
                        result.category + " - " + result.quizName;
                    var questionCount = Object.keys(result.quizQuestions).length;
                    var quizForm = document.createElement("form");
                    quizForm.id = "quizForm";
                    quizPage.document.getElementById("questions").appendChild(quizForm);
                    for (let i = 0; i < questionCount; i++) {
                        var questionHeading = document.createElement("h4");
                        questionHeading.id = "questionHeading";
                        questionHeading.innerHTML = "Question" + " " + (i + 1);
                        var question = document.createElement("div");
                        question.id = "question" + (i + 1);
                        var newline2 = document.createElement("br");
                        var newline4 = document.createElement("br");
                        var ptag = document.createElement("p");
                        var questionText = document.createTextNode(
                            result.quizQuestions[i].question
                        );
                        ptag.appendChild(questionText);
                        question.appendChild(questionHeading);
                        question.appendChild(newline4);
                        question.appendChild(ptag);
                        question.appendChild(newline2);
                        quizPage.document.getElementById("quizForm").appendChild(question);

                        var optionCount = Object.keys(
                            result.quizQuestions[i].options
                        ).length;
                        var options = document.createElement("div");
                        options.id = "question" + (i + 1) + "Options";
                        for (let j = 0; j < optionCount; j++) {
                            var radiobox = document.createElement("input");
                            radiobox.type = "radio";
                            radiobox.id = "q" + (i + 1) + "Option" + (j + 1);
                            radiobox.name = "q" + (i + 1) + "Options";
                           
                            
                            var label = document.createElement("label");
                            label.htmlFor = "q" + (i + 1) + "Option" + (j + 1);

                            var option = document.createTextNode(
                                " " + result.quizQuestions[i].options[j]
                            );
                            //this sets value of radio box to the option
                            radiobox.value= result.quizQuestions[i].options[j];
                            label.appendChild(option);

                            var newline = document.createElement("br");
                            var newline3 = document.createElement("br");

                            options.appendChild(radiobox);
                            options.appendChild(label);
                            options.appendChild(newline);
                            options.appendChild(newline3);

                            quizPage.document
                                .getElementById("question" + (i + 1))
                                .appendChild(options);
                        }
                    }
                    var sbDiv = document.createElement("div");
                    sbDiv.id = "submit_button";
                    var submitButton = document.createElement("button");
                    submitButton.innerHTML = "Submit";
                    submitButton.id ="btnSubmit";
                    submitButton.type = "button";
                    sbDiv.appendChild(submitButton);
                    quizPage.document.getElementById("quizForm").appendChild(sbDiv);

                    //this section handles the submit event handler
                    quizPage.document.querySelector("#btnSubmit").addEventListener("click", function(){
        
                        let quizResults = window.open("quizTestResults.html");
                        quizResults.addEventListener("DOMContentLoaded", () => {
                        //find which buttons are selected    
                        var answer =[] ;
                        for (let i =0; i< questionCount; i++){
                            var radio = quizPage.document.getElementsByName("q" + (i+1) + "Options");
                            for(let i = 0; i < radio.length; i++){
                                if (radio[i].checked){
                                answer.push(radio[i].value);
                                }     
                            }
                        
                         }
                        //get score
                         var score = getScore(answer, result);
                         var pointsArray = getPointsPerQuestion(answer, result);
                        


                         //this section dynamically creats first questionblock for heading and total score on the results page
                        var questionBlock = document.createElement("div");
                        questionBlock.id= "questionBlock";


                        var quizName = document.createElement("h3");
                        quizName.id = "quizName";
                        quizName.innerHTML = result.quizName + " Quiz";
                        var totalPoints = document.createElement("section");
                        totalPoints.id= "totalPoints";
                        
                         totalPoints.innerHTML = score;

                        questionBlock.appendChild(quizName);
                        questionBlock.appendChild(totalPoints);

                        quizResults.document.getElementById("resultBox").appendChild(questionBlock);



                         //dynamicallly create questionBlocks for each question 
                        for(let i= 0; i<questionCount; i++){
                            

                            //create questionblock
                            var questionBlock = document.createElement("div");
                            questionBlock.id = "questionBlock";
                            

                            var question = document.createElement("p");
                            question.innerHTML = "Question " + (i+1) + ":" + result.quizQuestions[i].question;
                           


                            var userAnswer = document.createElement("p");
                            userAnswer.id = "userAnswer";
                            userAnswer.innerHTML= "Your Answer: " + answer[i];
                            

                            var points =document.createElement("div");
                            points.id = "points";
                            points.innerHTML = pointsArray[i];
                            

                            questionBlock.appendChild(question);
                            questionBlock.appendChild(userAnswer);
                            questionBlock.appendChild(points);

                            quizResults.document.getElementById("resultBox").appendChild(questionBlock);

                        }

                        //add score to database
                         addNewScore(USER_EMAIL, result.quizName, score);
                         
                    });
                    quizPage.close();
                    });

                });

                modal.style.display = "none";
                
            });
            
            btnCancel1.addEventListener("click", function() {
                modal.style.display = "none";
            });

        });

    });
}

//this function calculates the score
function getScore(answerList, result){
    var userPoints = 0;
    var score;
    //console.log(answerList);
    //console.log(result)
    for(let i =0; i < Object.keys(result.quizQuestions).length; i++){
        if (answerList[i] == result.quizQuestions[i].answer ){
            userPoints += parseInt(result.quizQuestions[i].value);
        }
        //calculate score
        //console.log(result.totalPoints);
        score = (userPoints / parseInt(result.totalPoints)) * 100  ;
    }
    //console.log(score);
    return score.toFixed(2);
}
//this function returns an array of points earned by question
function getPointsPerQuestion(answerList, result){
    var pointsList = [];
    for(let i =0; i < Object.keys(result.quizQuestions).length; i++){
        
        if (answerList[i] == result.quizQuestions[i].answer ){
            pointsList.push(result.quizQuestions[i].value);
        }
        else{
            pointsList.push("0");
        }
        
    }
    return pointsList;
}
//functions to load quiz descriptions
// History quiz 1
let HST01 = document.getElementById("HST01");
if (HST01) {
    fetchHST01().then(function(results) {
        //get quiz name
        var title = document
            .getElementById("HST01")
            .getElementsByClassName("title")[0];
        const quizName = document.createTextNode(
            results.category + "-" + results.quizName + " Quiz"
        );
        title.appendChild(quizName);
        //get description
        var description = document
            .getElementById("HST01")
            .getElementsByClassName("description")[0];
        const quizDescription = document.createTextNode(
            "Description: " + results.description
        );
        description.appendChild(quizDescription);
        //get number of questions
        var numQuestions = document
            .getElementById("HST01")
            .getElementsByClassName("numQuestions")[0];
        const number = document.createTextNode(
            "Questions: " + Object.keys(results.quizQuestions).length
        );
        numQuestions.appendChild(number);
        //get total points
        var totalPoints = document
            .getElementById("HST01")
            .getElementsByClassName("totalPoints")[0];
        const quizPoints = document.createTextNode(
            "Total Points: " + results.totalPoints + " Pts"
        );
        totalPoints.appendChild(quizPoints);
    });
}

// History quiz 2
let HST02 = document.getElementById("HST02");
if (HST02) {
    fetchHST02().then(function(results) {
        //get quiz name
        var title = document
            .getElementById("HST02")
            .getElementsByClassName("title")[0];
        const quizName = document.createTextNode(
            results.category + "-" + results.quizName + " Quiz"
        );
        title.appendChild(quizName);
        //get description
        var description = document
            .getElementById("HST02")
            .getElementsByClassName("description")[0];
        const quizDescription = document.createTextNode(
            "Description: " + results.description
        );
        description.appendChild(quizDescription);
        //get number of questions
        var numQuestions = document
            .getElementById("HST02")
            .getElementsByClassName("numQuestions")[0];
        const number = document.createTextNode(
            "Questions: " + Object.keys(results.quizQuestions).length
        );
        numQuestions.appendChild(number);
        //get total points
        var totalPoints = document
            .getElementById("HST02")
            .getElementsByClassName("totalPoints")[0];
        const quizPoints = document.createTextNode(
            "Total Points: " + results.totalPoints + " Pts"
        );
        totalPoints.appendChild(quizPoints);
    });
}

// Science quiz 1
let SCI01 = document.getElementById("SCI01");
if (SCI01) {
    fetchSCI01().then(function(results) {
        //get quiz name
        var title = document
            .getElementById("SCI01")
            .getElementsByClassName("title")[0];
        const quizName = document.createTextNode(
            results.category + "-" + results.quizName + " Quiz"
        );
        title.appendChild(quizName);
        //get description
        var description = document
            .getElementById("SCI01")
            .getElementsByClassName("description")[0];
        const quizDescription = document.createTextNode(
            "Description: " + results.description
        );
        description.appendChild(quizDescription);
        //get number of questions
        var numQuestions = document
            .getElementById("SCI01")
            .getElementsByClassName("numQuestions")[0];
        const number = document.createTextNode(
            "Questions: " + Object.keys(results.quizQuestions).length
        );
        numQuestions.appendChild(number);
        //get total points
        var totalPoints = document
            .getElementById("SCI01")
            .getElementsByClassName("totalPoints")[0];
        const quizPoints = document.createTextNode(
            "Total Points: " + results.totalPoints + " Pts"
        );
        totalPoints.appendChild(quizPoints);
    });
}

// Science quiz 2
let CIS02 = document.getElementById("CIS02");
if (CIS02) {
    fetchCIS02().then(function(results) {
        //get quiz name
        var title = document
            .getElementById("CIS02")
            .getElementsByClassName("title")[0];
        const quizName = document.createTextNode(
            results.category + "-" + results.quizName + " Quiz"
        );
        title.appendChild(quizName);
        //get description
        var description = document
            .getElementById("CIS02")
            .getElementsByClassName("description")[0];
        const quizDescription = document.createTextNode(
            "Description: " + results.description
        );
        description.appendChild(quizDescription);
        //get number of questions
        var numQuestions = document
            .getElementById("CIS02")
            .getElementsByClassName("numQuestions")[0];
        const number = document.createTextNode(
            "Questions: " + Object.keys(results.quizQuestions).length
        );
        numQuestions.appendChild(number);
        //get total points
        var totalPoints = document
            .getElementById("CIS02")
            .getElementsByClassName("totalPoints")[0];
        const quizPoints = document.createTextNode(
            "Total Points: " + results.totalPoints + " Pts"
        );
        totalPoints.appendChild(quizPoints);
    });
}

// Engineering quiz 2
let MEC01 = document.getElementById("MEC01");
if (MEC01) {
    fetchMEC01().then(function(results) {
        //get quiz name
        var title = document
            .getElementById("MEC01")
            .getElementsByClassName("title")[0];
        const quizName = document.createTextNode(
            results.category + "-" + results.quizName + " Quiz"
        );
        title.appendChild(quizName);
        //get description
        var description = document
            .getElementById("MEC01")
            .getElementsByClassName("description")[0];
        const quizDescription = document.createTextNode(
            "Description: " + results.description
        );
        description.appendChild(quizDescription);
        //get number of questions
        var numQuestions = document
            .getElementById("MEC01")
            .getElementsByClassName("numQuestions")[0];
        const number = document.createTextNode(
            "Questions: " + Object.keys(results.quizQuestions).length
        );
        numQuestions.appendChild(number);
        //get total points
        var totalPoints = document
            .getElementById("MEC01")
            .getElementsByClassName("totalPoints")[0];
        const quizPoints = document.createTextNode(
            "Total Points: " + results.totalPoints + " Pts"
        );
        totalPoints.appendChild(quizPoints);
    });
}

// Engineering quiz 2
let CIS01 = document.getElementById("CIS01");
if (CIS01) {
    fetchCIS01().then(function(results) {
        //get quiz name
        var title = document
            .getElementById("CIS01")
            .getElementsByClassName("title")[0];
        const quizName = document.createTextNode(
            results.category + "-" + results.quizName + " Quiz"
        );
        title.appendChild(quizName);
        //get description
        var description = document
            .getElementById("CIS01")
            .getElementsByClassName("description")[0];
        const quizDescription = document.createTextNode(
            "Description: " + results.description
        );
        description.appendChild(quizDescription);
        //get number of questions
        var numQuestions = document
            .getElementById("CIS01")
            .getElementsByClassName("numQuestions")[0];
        const number = document.createTextNode(
            "Questions: " + Object.keys(results.quizQuestions).length
        );
        numQuestions.appendChild(number);
        //get total points
        var totalPoints = document
            .getElementById("CIS01")
            .getElementsByClassName("totalPoints")[0];
        const quizPoints = document.createTextNode(
            "Total Points: " + results.totalPoints + " Pts"
        );
        totalPoints.appendChild(quizPoints);
    });
}

// Math quiz 1
let MTH01 = document.getElementById("MTH01");
if (MTH01) {
    fetchMTH01().then(function(results) {
        //get quiz name
        var title = document
            .getElementById("MTH01")
            .getElementsByClassName("title")[0];
        const quizName = document.createTextNode(
            results.category + "-" + results.quizName + " Quiz"
        );
        title.appendChild(quizName);
        //get description
        var description = document
            .getElementById("MTH01")
            .getElementsByClassName("description")[0];
        const quizDescription = document.createTextNode(
            "Description: " + results.description
        );
        description.appendChild(quizDescription);
        //get number of questions
        var numQuestions = document
            .getElementById("MTH01")
            .getElementsByClassName("numQuestions")[0];
        const number = document.createTextNode(
            "Questions: " + Object.keys(results.quizQuestions).length
        );
        numQuestions.appendChild(number);
        //get total points
        var totalPoints = document
            .getElementById("MTH01")
            .getElementsByClassName("totalPoints")[0];
        const quizPoints = document.createTextNode(
            "Total Points: " + results.totalPoints + " Pts"
        );
        totalPoints.appendChild(quizPoints);
    });
}


let MTH02 = document.getElementById("MTH02");
if (MTH02) {
    fetchMTH02().then(function(results) {
        //get quiz name
        var title = document
            .getElementById("MTH02")
            .getElementsByClassName("title")[0];
        const quizName = document.createTextNode(
            results.category + "-" + results.quizName + " Quiz"
        );
        title.appendChild(quizName);
        //get description
        var description = document
            .getElementById("MTH02")
            .getElementsByClassName("description")[0];
        const quizDescription = document.createTextNode(
            "Description: " + results.description
        );
        description.appendChild(quizDescription);
        //get number of questions
        var numQuestions = document
            .getElementById("MTH02")
            .getElementsByClassName("numQuestions")[0];
        const number = document.createTextNode(
            "Questions: " + Object.keys(results.quizQuestions).length
        );
        numQuestions.appendChild(number);
        //get total points
        var totalPoints = document
            .getElementById("MTH02")
            .getElementsByClassName("totalPoints")[0];
        const quizPoints = document.createTextNode(
            "Total Points: " + results.totalPoints + " Pts"
        );
        totalPoints.appendChild(quizPoints);
    });
}