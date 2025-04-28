import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Logout({ shown, setShown }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const { checkLogin } = useAuth();

  if (shown === false) {
    return null;
  }

  const handleLogoutbutton = async () => {
    setStatus("Logging out...");

    try {
      const res = await axios.get(`${backendUrl}/logout`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setStatus("Logout successful");
        console.log("Logout successful");

        setTimeout(() => {
          checkLogin();
          setShown(false);
          console.log("Redirecting to home", window.location.pathname);
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      console.error("Error:", err);
      setStatus("Logout failed. Please try again.");
    }
  };

  return (
    <div className="back-screen" onClick={() => setShown(false)}>
      <div className="logout container">
        <h1>Logout</h1>
        <h3> Sure to logout? </h3>

        <div className="button_group">
          <button
            className="logout_button"
            onClick={() => handleLogoutbutton()}
          >
            Logout
          </button>
          <button className="cancel_button" onClick={() => setShown(false)}>
            Cancel
          </button>
        </div>

        {status && <p>{status}</p>}
      </div>
    </div>
  );
}

export default Logout;
