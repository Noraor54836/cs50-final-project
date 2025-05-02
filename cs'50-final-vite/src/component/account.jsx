import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Account() {
  const { user, isLoggedIn } = useAuth();
  const [userdata, setUserdata] = useState({});

  return <div className="container account"></div>;
}

export default Account;
