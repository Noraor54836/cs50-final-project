import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import StarBackground from "./starbg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const Loginsubmit = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/login`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.message === "Login successful" && res.status === 200) {
        setIsLoggedIn(true);
        setError("");
        console.log("Login successful", res.data);

        setTimeout(() => {
          setIsLoggedIn(false);
          navigate("/home", { replace: true });
        }, 2000);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid username or password");
      } else {
        setError("An error occurred. Please try again.");
        console.error("Error:", err);
      }
    } finally {
      setUsername("");
      setPassword("");
    }
  };

  return (
    <>
      <div className="container login">
        <StarBackground content="login" />
        <div className="login_layout">
          <form>
            <div className="login-form">
              <h1>Login</h1>

              <div className="text-login">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                className="login_button"
                onClick={Loginsubmit}
              >
                <span>Login</span>
              </button>
              {error && <p className="error">{error}</p>}
              {isLoggedIn && <p className="success">Login successful!</p>}
              <p>
                Don't have an account? <Link to="/register">Sign up</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
