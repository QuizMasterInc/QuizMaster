# Set up MongoDB Database
The project code is currently set up with a private MongoDB account. 
You will need to set up a new account for the team and change the uri credentials on line 10 of index.js.
Account creation was free and a free account should provide enough space. A basic understanding of how Mongo collections are formatted and queried is encouraged. MongoDB offers a free intro. course on their MongoDB University site.

The original set up for a quiz collection was each document was a quiz with a description, name, category, points possible, and an array of questions. Each question was its own object with the question text, an array of choices, an answer, and point value.

Student documents contained an email, display name, and an array of past quiz results.


# Set up Firebase Authentication
QuizMaster is using a private firebase account for firebase authentication and deployment. For authentication, 
the configuration object for firebase authentication must be changed for lines 11-18 of authentication.js. 
This includes the new apiKey, authDomain, projectId, storage bucket, messaginSenderId, and appId.

Set up firebase: https://www.youtube.com/playlist?list=PL4cUxeGkcC9jERUGvbudErNCeSZHWUVlb

Videos 1,3, and 11-13 from the playlist are very helpful for this portion.

# Set up Firebase Deployment
Deployment must be node deployment and not a static deployment. Youtube tutorial used for this portion: https://www.youtube.com/watch?v=AgyO1a0FnWA&ab_channel=khabanh. 

- A Blaze account is required for node deployment. It is very unlikely for a small scaled project to be charged using this method. 