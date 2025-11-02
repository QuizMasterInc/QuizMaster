/**
 * This route will redirect users that are not authenticated to the signin page
 * Used so only authenticated users can access certain pages, like the quizzes page.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const {profile} = useAuth(); // or const { currentUser, profile } = useAuth();
  return (profile && profile.role === 'developer') ? children : <Navigate to="/"/>;
}

