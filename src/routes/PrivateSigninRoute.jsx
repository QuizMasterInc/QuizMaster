/**
 * This route will redirect authenticated users back to the dashboard page.
 * Used to prevent authenticated users from accessing login pages.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  return !currentUser ? children : <Navigate to="/dashboard" />;
}
