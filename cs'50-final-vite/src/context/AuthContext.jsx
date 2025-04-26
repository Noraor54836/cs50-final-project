import React, { createContext, useState, useContext } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLogin = async () => {
    try {
      const res = await axios.get(`${backendUrl}/checklogin`, {
        withCredentials: true,
      });

      if (res.data.authenticated === true && res.status === 200) {
        setIsLoggedIn(true);
        setUser(res.data.user_id);
        console.log("User is logged in", res.data);
      }
    } catch (err) {
      console.error("Error:", err.response.data);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, checkLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
