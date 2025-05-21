import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useUserdata } from "../context/Userdata";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Logout({ shown, setShown }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const { checkLogin } = useAuth();
  const { setUsermaindata } = useUserdata();

  if (shown === false) {
    return null;
  }

  const handleClose = () => {
    setShown(false);
    setStatus("");
    setError("");
  };

  const handleLogoutbutton = async () => {
    setStatus("Logging out...");

    try {
      const res = await axios.get(`${backendUrl}/logout`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setUsermaindata({});
        setStatus("Logout successful");
        console.log("Logout successful");

        setTimeout(() => {
          checkLogin();
          setShown(false);
          setStatus("");
          setError("");
          window.location.reload();
          console.log("Redirecting to home", window.location.pathname);
          navigate("/login", { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Logout failed. Please try again.");
    }
  };

  return (
    <div className="logout">
      <div className="back-screen" onClick={() => handleClose()}></div>
      <div className="logout_container">
        <h3> logout? </h3>

        <div className="button_group">
          <button
            className="logout_button"
            onClick={() => handleLogoutbutton()}
          >
            Logout
          </button>
          <button
            className="logout_button cancel"
            onClick={() => handleClose()}
          >
            Cancel
          </button>
        </div>

        {status && <p className="logout_status">{status}</p>}
        {error && <p className="logout_error">{error}</p>}
      </div>
    </div>
  );
}

export default Logout;
