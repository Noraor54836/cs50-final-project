import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [con_password, setCon_Password] = useState("");
  const [username_error, setUsername_Error] = useState("");
  const [password_error, setPassword_Error] = useState("");
  const [isregister, setIsRegister] = useState(false);

  const Registersubmit = async () => {
    if (username.trim() === "") {
      setUsername_Error("Username is required");
      return;
    }
    if (password.trim() === "") {
      setPassword_Error("Password is required");
      return;
    }
    if (password.trim() !== con_password.trim()) {
      setPassword_Error("Passwords do not match");
      return;
    }
    if (password.length > 20 || username.length > 20) {
      setPassword_Error(
        "Password and username must be less than 20 characters"
      );
      setPassword("");
      setUsername("");
      return;
    }
    if (password.length < 8 || username.length < 3) {
      setPassword_Error(
        "Password must be at least 8 characters and username must be at least 3 characters"
      );
      setPassword("");
      setUsername("");
      return;
    }
    if (username.includes(" ")) {
      setUsername_Error("Username cannot have white space");
      return;
    }
    if (password.includes(" ")) {
      setPassword_Error("Password cannot have white space");
      return;
    }

    try {
      username = username.trim();
      password = password.trim();

      const res = await axios.post(
        `${backendUrl}/register`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        setIsRegister(true);
        setUsername_Error("");
        setPassword_Error("");
        setUsername("");
        setPassword("");
        setCon_Password("");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setUsername_Error("Username already exists");
      } else {
        console.error("Error:", err);
        setUsername_Error(err.response.data.error);
      }

      setUsername("");
      setPassword("");
      setCon_Password("");
    } finally {
      if (isregister) {
        setTimeout(() => {
          setIsRegister(false);
          window.location.href = "/login";
        }, 1000);
      }
    }
  };

  const handleInputUsername = (e) => {
    const { data, target } = e;
    const { value } = target;

    if (data === " ") {
      setUsername_Error("Username cannot have white space");
      setUsername(value.slice(0, -1));
      return;
    }

    if (value.length < 3) {
      setUsername_Error("Username must be at least 3 characters");
    } else {
      setUsername_Error("");
    }

    if (value.length > 20) {
      setUsername_Error("Username must be less than 20 characters");
      setUsername(value.slice(0, -1));
      return;
    } else {
      setUsername_Error("");
    }
  };

  const handleInputPassword = (e) => {
    const { data, target } = e;
    const { value } = target;

    if (data === " ") {
      setPassword_Error("Password cannot have white space");
      setPassword(value.slice(0, -1));
      return;
    }

    if (value.length < 8) {
      setPassword_Error("Password must be at least 8 characters");
    } else {
      setPassword_Error("");
    }

    if (value.length > 20) {
      setPassword_Error("Password must be less than 20 characters");
      setPassword(value.slice(0, -1));
      return;
    } else {
      setPassword_Error("");
    }
  };

  return (
    <>
      <div className="container register">
        <h1>Register</h1>
        <form>
          <div className="register-form">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                handleInputUsername(e);
              }}
              required
            />
            {username_error && <p className="error">{username_error}</p>}
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handleInputPassword(e);
              }}
              required
            />
            <label htmlFor="con_password">Confirm Password:</label>
            <input
              type="password"
              id="con_password"
              value={con_password}
              onChange={(e) => setCon_Password(e.target.value)}
              required
            />
            {password_error && <p className="error">{password_error}</p>}
            <button type="button" onClick={Registersubmit}>
              Register
            </button>
            {isregister && <p className="success">Registration successful!</p>}
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
