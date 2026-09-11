### Overview

The team plans to meet on Tuesdays before normal class hours (2 pm) every week in order to review the progress that has been made, but since Michael has classes everyday but Thursday and Coltin has to only go this class we decided that if Michael doesn't feel like coming in for the second week of the sprint then Michael will notify Coltin and we will be in touch through Discord.

We also plan on using our Discord server for consistent communication throughout each sprint. 

The team uses an organized spreadsheet for management of the development of this project.

### Recent Changes During Sprint 1

Since we are just starting with Sprint 1, our main focus was getting back up to speed with how the system worked. We downsized from 3 people to 2 people so adjusting to that has been a priority. We felt like we needed to do something so we tried to do some code because we felt like if we didn't do some code we would be slacking almost.

### Plans for CI/CD

To separate testing from production, this repository has two branches. The main branch will hold production code. Only code that is set to be used by consumers should be pushed to this branch. All other code will be pushed to the "testing" branch after it has been shown running locally on their own machine. This will ensure that once a site is live and usable, the team can work on adding features or functionality to the project without breaking what currently works. Team members can update the testing branch during a sprint and when the team is satisfied with the changes, these changes can finally be merged with the main branch. This setup will require developers to make sure they pull from the testing branch prior to altering the code so that the development code is not changed by mistake. Furthermore, the testing branch will also be hosted, letting users test the new changes if they so desire. 

### System Process and Configuration with Firebase 

The CI/CD is set up and properly connected to the repository for QuizMaster. The application is set up as a single page web application. There is a generic index.html for main. React doesn't use multiple html pages and they inject new pages through JavaScript. 

### New Team Member Configuration

Each member was invited to become a Owner through Firebase(Given the Developer role for full access) and GitHub organization to access the production environment for the project. It is to our discretion the amount of permissions they have within our Firebase project, and GitHub organization.  

### New User Configuration

When a new user comes to our product, we plan on having clear instruction on how the product works. We also plan on encouraging the correct usage of the product, and to authenticate themselves. 

### Definition of Done

Here is our definition of done.

- Merged from development to production
- Can be demoed
- Everyone agrees that it meets story's expectations
- At least one GitHub commit to the product branch with a commit message "'Story Number' done".