# Routes

## Purpose
This folder contains all the components used for routing. The routing components uses the authContext to determine if
the current user is authenticated and will redirect the user. You call these routes in the App.jsx file.
See App.jsx for how to use the routes.

* PrivateRoute - Used so only authenticated users can access certain pages, like the quizzes page. Redirects to signin page.

* PrivateSigninRoute - Used to prevent authenticated users from accessing login pages. Redirects to dashboard.
