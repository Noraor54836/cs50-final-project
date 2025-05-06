import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useUserdata } from "./Userdata";

const ProtectedRoute = () => {
  const { isLoggedIn, checkLogin } = useAuth();
  const { Usermaindata, getuserdata } = useUserdata();
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

  useEffect(() => {
    console.log("ProtectedRoute useEffect check data");
    if (isLoggedIn && !isChecking) {
      getuserdata();
      console.log("ProtectedRoute useEffect passed", isChecking, isLoggedIn);
    }
  }, [isLoggedIn, isChecking]);

  if (isChecking) {
    console.log("ProtectedRoute: Checking authentication...");
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    console.log(
      "ProtectedRoute: User is not logged in, redirecting to login page."
    );
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: User is logged in, rendering child routes.");
  console.log(Usermaindata, "usermaindata");
  return <Outlet />;
};

export default ProtectedRoute;
