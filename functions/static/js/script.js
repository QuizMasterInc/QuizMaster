// jQuery [
// Function to load the navigation bar onto #main-menu id tag in html files.
console.log("CALLED SCRIPT.JS");
$(function() {
    $("#main-menu").load("common/navbar.html");
});
// Function to load the footer bar onto #footer id tag in html files.
$(function() {
    $("#footer").load("common/footer.html");
});
// Function to load the header bar onto #header id tag in html files.
$(function() {
    $("#header").load("common/header.html");
});

//Function to load confirmation for quiz and redirect to quiz page)
$("#confirmStart").on("click", async() => {
    let confirmAction = confirm("You're about to take a quiz.");
    if (confirmAction) {
        window.open("quizPage.html");
    } else {
        alert("Action canceled");
    }
});

// const btnHistory1 = document.getElementById("btnHistory1");
// btnHistory1.addEventListener("click", function() {
//     let confirmAction = confirm("You're about to take a quiz.");
//     if (confirmAction) {
//         const quizPage = window.open("quizPage.html");
//         quizPage.addEventListener("DOMContentLoaded", () => {
//             // Now we can access the #test element on the other page
//             const question1 = quizPage.document.getElementById("q1");
//             question1.textContent = "Hello world!";
//         });
//     } else {
//         alert("Action canceled");
//     }
//     console.log("You clicked history1 button!");
// });

// // READ (find listing)
// async function findOneListingByName(client, nameOfListing) {
//     const result = await client
//         .db("Quiz-Capstone")
//         .collection("Quiz")
//         .findOne({ quizName: nameOfListing });

//     if (result) {
//         console.log(
//             `Found a listing in the collection with the name '${nameOfListing}'`
//         );
//         console.log(result);
//         return result;
//     } else {
//         console.log(`No listings found with the name '${nameOfListing}'`);
//     }
// }

// End of jQuery ]