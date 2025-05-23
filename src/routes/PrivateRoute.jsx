/**
 * This route will redirect users that are not authenticated to the signin page
 * Used so only authenticated users can access certain pages, like the quizzes page.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  return currentUser ? children : <Navigate to="/" />;
}
