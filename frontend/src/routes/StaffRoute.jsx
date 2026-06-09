import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  // Allow both admin and staff
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StaffRoute;
