import React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default App;
