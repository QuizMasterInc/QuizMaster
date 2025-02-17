//Route for non-signed in users
// Probably gonna remain unused for awhile
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute({ children }) {
  const { currentUser } = useAuth();

  // If the user is authenticated, redirect them to a different route (e.g., homepage)
  return !currentUser ? children : <Navigate to="/" />;
}