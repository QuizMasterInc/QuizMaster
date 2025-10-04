# NavBar Components

## Purpose
Contains the main navigation bar that appears at the top of every page, showing different menu options based on whether the user is logged in or not.

## Components

### NavBar.jsx
The main navigation menu that shows different links based on user login status:
- **Logged in users**: Dashboard, Quiz Selection, My Flashcards, Create Quiz, Create Flashcards
- **Guest users**: Home, Login/Register links
- **Developer users**: Additional developer tools access

### NavBarUser.jsx
The user menu in the top-right corner showing the user's email and logout option. Only visible when someone is logged in.
