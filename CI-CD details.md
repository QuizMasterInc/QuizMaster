### Plans for CI/CD

To separate testing from production, this repository has two branches. The main branch will hold production code. Only code that is set to be used by consumers should be pushed to this branch. All other code will be pushed to the "Testing" branch. This will ensure that once a site is live and usable, the team can work on adding features or functionality to the project without breaking what currently works. Team members can update the testing branch during a sprint and when the team is satisfied with the changes, these changes can finally be merged with the main branch. This setup will require developers to make sure they pull from the Testing branch prior to altering the code so that the development code is not changed by mistake.

### System Process and Configuration with Azure

The CI/CD is set up and properly connected to the repository for QuizMaster. The application is set up as static web application. There is a generic index.html for main. When there are any versions of code available it will be set up through the additional branches created for testing. 
