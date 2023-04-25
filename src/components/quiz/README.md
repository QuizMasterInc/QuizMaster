# Quiz Component

## Purpose

This folder contains the components for the QuizActivity. The actual QuizActivity component is the parent component that drives the code for this page. We are mounting the QuizActivity component, then after the quiz questions have been pulled, we are then mounting the Question component based on how many questions we pulled. After the questions have been successfully mounted, we then start the timer for the quiz. Once the user clicks submit, or the timer is done, the score for that specific user gets sent to the database, and the modal appears for the score. The user can then exit out of the modal and see what questions they got wrong and correct, or the modal allows them to try a different quiz. 