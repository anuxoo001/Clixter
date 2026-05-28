import { Navigate } from "react-router-dom";
import useAuthCheck from "../hooks/useAuthCheck";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authChecked } = useAuthCheck();

  if (!authChecked) return <div className="h-screen w-screen bg-black"></div>;

  return isAuthenticated ? children : <Navigate to="/auth-login" replace />;
}
