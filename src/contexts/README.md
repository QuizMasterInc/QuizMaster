# Contexts

## Purpose

This folder contains the contexts to be used throughout the application. There are two contexts, one for sharing category data, and one for authentication. These contexts will share its state with any child component. You use these to wrap child components in order to get shared state throughout the application. For example, the AuthContext is used throughout many different components for user authentication. It is sharing its data to these components without the need to create seperate props. See comments in each context file for more explanations and details. 