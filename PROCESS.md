### Overview

The team aims to meet on Tuesday's at 2PM each week in order to review the progress that is made.

This way there is communication between teammembers at least once a week and a review of the team's work near the end of the sprint. 

We also plan on using our Discord server for contstant communication. 

The team uses GitHub projects for management of the developement of this project.

### Plans for CI/CD

To separate testing from production, this repository has two branches. The main branch will hold production code. Only code that is set to be used by consumers should be pushed to this branch. All other code will be pushed to the "testing" branch. This will ensure that once a site is live and usable, the team can work on adding features or functionality to the project without breaking what currently works. Team members can update the testing branch during a sprint and when the team is satisfied with the changes, these changes can finally be merged with the main branch. This setup will require developers to make sure they pull from the testing branch prior to altering the code so that the development code is not changed by mistake. Furthermore, the testing branch will have its own URL, letting users test the new changes. 

### System Process and Configuration with Firebase 

The CI/CD is set up and properly connected to the repository for QuizMaster. The application is set up as a single page web application. There is a generic index.html for main. React doesn't use multiple html pages and they inject new pages through JavaScript. 

### New Team Member Configuration

Each member was invited to become a user through Firebase and GitHub organization to access the production environment for the project. It is to our discretion the amount of permissions they have within our Firebase project, and GitHub organization.  

### New User Configuration

When a new user comes to our product, we plan on having clear instruction on how the product works. We also plan on encouraging the correct usage of the product, and to authenticate themselves. 

### Definition of Done

Here is our definition of done.

- In production
- Can be demoed
- Everyone agrees that it meets the expectations outlined in the story 

