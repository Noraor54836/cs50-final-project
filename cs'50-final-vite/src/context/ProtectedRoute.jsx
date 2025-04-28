import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = () => {
  const { isLoggedIn, checkLogin } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      console.log("protected route useEffect check");
      await checkLogin();
      setIsChecking(false);
      console.log("protected route useEffect passed");
    };
    verifyAuth();
  }, []);

  if (isChecking) {
    console.log("ProtectedRoute: Checking authentication...");
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isLoggedIn) {
    console.log(
      "ProtectedRoute: User is not logged in, redirecting to login page."
    );
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: User is logged in, rendering child routes.");
  return <Outlet />;
};

export default ProtectedRoute;
