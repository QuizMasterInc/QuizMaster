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


# Clarification

When attempting to get this project working for a new team, consider making a new repository and slowly moving the project over to make sure it is working how it should be. It is important to note that the current firebase files in the project are configured to an existing private firebase account and therefore, should be replaced/added once the project is redeployed with a new account and configuration. 

Making a new repository and going through the deployment steps should be the first step. The next step should be to migrate the files over with the same structure as the current repository. Lastly, create a new database and connect to it. 

The new project should start with a clean package.json to add firebase, mongodb, and node.

Inside the functions directory, you will find index.js. This file takes care of the backend for the application (takes care of connecting to the database and creating node routes). All the static files are found and configured to be inside the static directory. 