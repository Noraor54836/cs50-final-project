import React, { use } from "react";
import Navbar from "./component/navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Layout() {
  const { isAuthenticated, checkLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`layout useEffect ${window.location.pathname}`);
    checkLogin();
  }, []);

  return (
    <div className="app">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
