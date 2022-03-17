### Overview

The team aims to meet on Wednesday's at 5PM each week in order to review the progress that is made. For sprint review, we plan to meet Wednesdays at Noon or Wednesdays at 5PM depending on instructor availability.

This way there is communication between teammembers at least once a week and a review of the team's work near the end of the sprint. 

The team uses Trello for project management and organization of tasks. During sprint 2 we successfully used this application to assign tasks for each group member and moved items to the completed list when they were done.

### Plans for CI/CD

To separate testing from production, this repository has two branches. The main branch will hold production code. Only code that is set to be used by consumers should be pushed to this branch. All other code will be pushed to the "Testing" branch. This will ensure that once a site is live and usable, the team can work on adding features or functionality to the project without breaking what currently works. Team members can update the testing branch during a sprint and when the team is satisfied with the changes, these changes can finally be merged with the main branch. This setup will require developers to make sure they pull from the Testing branch prior to altering the code so that the development code is not changed by mistake.

### System Process and Configuration with Azure

The CI/CD is set up and properly connected to the repository for QuizMaster. The application is set up as static web application. There is a generic index.html for main. When there are any versions of code available it will be set up through the additional branches created for testing. 

### New User Configuration

Each member was invited to become a user through Azure to access the production environment for the project. Each user will have full capabilities. 

### New Guest Configuration

Guest will be added as users with a guest perspective. This way they will not be able to access the same abilities as the team. 
