### Overview

The team aims to meet on Tuesday's at 2PM each week in order to review the progress that is made.

This way there is communication between teammembers at least once a week and a review of the team's work near the end of the sprint. 

We also plan on using our Discord server for contstant communication. 

The team uses GitHub projects for management of the developement of this project.

### Plans for CI/CD

To separate testing from production, this repository has two branches. The main branch will hold production code. Only code that is set to be used by consumers should be pushed to this branch. All other code will be pushed to the "staging" branch. This will ensure that once a site is live and usable, the team can work on adding features or functionality to the project without breaking what currently works. Team members can update the staging branch during a sprint and when the team is satisfied with the changes, these changes can finally be merged with the main branch. This setup will require developers to make sure they pull from the staging branch prior to altering the code so that the development code is not changed by mistake.

### System Process and Configuration with Firebase 

The CI/CD is set up and properly connected to the repository for QuizMaster. The application is set up as a single page web application. There is a generic index.html for main. React doesn't use multiple html pages and they inject new pages through JavaScript. 

### New User Configuration

Each member was invited to become a user through Firebase to access the production environment for the project. Each user will have full capabilities. 

### New Guest Configuration

Guest will be added as users with a guest perspective. This way they will not be able to access the same abilities as the team. 

### Definition of Done

Here is our definition of done.

- In production
- Can be demoed
- Everyone agrees that it is done

