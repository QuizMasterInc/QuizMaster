### MVP 

A Minimum Viable Product (MVP) is defined as a product with enough features to attract early-adopter customers and validate a product early in the product development cycle. We can use an MVP to help the product team receive user feedback as quickly as possible to iterate and improve the product. There are three key characteristics of an MVP: it has enough value that people are willing to use it or buy it initially, it demonstrates enough future benefit to retain early adopters, and it provides a feedback loop to guide future development. There are also many purposes for an MVP: test a product hypothesis, accelerate learning, build a brand quickly, find a base for other products, reduce wasted engineering hours, establish an engineer’s abilities in crafting, and getting a product to early customers as soon as possible. 

As a member of the Scrum Team, Team Fun, we have decided to develop the QuizMaster product. We are utilizing the following tech stack: React, TailwindCSS, Firebase authentication, Firebase Firestore, and Google Cloud Functions with Go. Our main goal in development of this application is to learn some good technologies and develop a worthwhile application that actual users with use. If our MVP will be developed by Sprint 4, we need to have the following implemented: authentication, database, and our serverless function to work. Authentication is probably the most important aspect of our MVP to be delivered because it allows users to trust in our product before they use it. Furthermore, authentication allows the application to recognize users and their quizzes. This means that we can save quizzes completed at a user-by-user basis. For the application to save different quizzes completion we need to develop our database. The database will be used to save completion of quizzes by users, user information, and the actual quizzes themselves. Once we have quizzes saved within our database, we want to use our serverless function to deliver a quiz to our users. The interesting thing about a serverless function is that we don’t need a back end to fully developed. Serverless functions is hosted and maintained on infrastructure by cloud computing companies. These companies take care of code maintenance and execution so that developer can deploy new code faster and easier. 

By Sprint 4 we plan on having at least one quiz available for use. We think that we want to follow the same game plan of the group before us, and have different quizzes for different subjects, and then have more difficult quizzes within that subject. For that one quiz we plan on having at least 10 questions, 4 choices per question, and one answer per question. Once the quiz is completed, the user will be able to click submit. After this occurs, the questions themselves will be “self-graded” and change the color to red if they got it wrong, and green if they got it right. We then will save their progress within the database. We will allow users to retake quizzes if they want to so they can improve their skills.

This project was developed by the group in the previous capstone class. This project did not use React, nor did it use Go; this was the defined technology in the plan for this project. We plan starting this project from scratch and recycle some HTML elements from the previous group. We will also have to restart the back-end of the project to totally utilize Firebase. 