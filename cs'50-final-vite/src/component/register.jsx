import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Register() {
  const navigate = useNavigate();

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
    if (password.length < 9 || username.length < 4) {
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
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      const res = await axios.post(
        `${backendUrl}/register`,
        {
          username: trimmedUsername,
          password: trimmedPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        setIsRegister(true);
        setUsername_Error("");
        setPassword_Error("");
        console.log(res.data, res);

        setTimeout(() => {
          setIsRegister(false);
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setUsername_Error("Username already exists");
        console.error("Error:", err.response.data);
      } else {
        console.error("Error:", err);
        setUsername_Error(err.response.data.error);
      }
    } finally {
      setUsername("");
      setPassword("");
      setCon_Password("");

      console.log("finally");
    }
  };

  const handleInputUsername = (e) => {
    const { nativeEvent, target } = e;
    const { data } = nativeEvent;
    const { value } = target;

    if (data === " ") {
      setUsername_Error("Username cannot have white space");
      return;
    }

    if (value.length < 4) {
      setUsername_Error("Username must be at least 3 characters");
    } else if (value.length > 20) {
      setUsername_Error("Username must be less than 20 characters");
      return;
    } else {
      setUsername_Error("");
    }

    setUsername(value);

    console.log(`Username: ${username}, ${data}, ${value.length}`);
  };

  const handleInputPassword = (e) => {
    const { nativeEvent, target } = e;
    const { data } = nativeEvent;
    const { value } = target;

    if (data === " ") {
      setPassword_Error("Password cannot have white space");
      return;
    }

    if (value.length < 9) {
      setPassword_Error("Password must be at least 8 characters");
    } else if (value.length > 20) {
      setPassword_Error("Password must be less than 20 characters");
      return;
    } else {
      setPassword_Error("");
    }

    setPassword(value);

    console.log(`Password: ${password}`);
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
                handleInputUsername(e);
              }}
              required
              autoComplete="off"
            />
            {username_error && <p className="error">{username_error}</p>}
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                handleInputPassword(e);
              }}
              required
              autoComplete="off"
            />
            <label htmlFor="con_password">Confirm Password:</label>
            <input
              type="password"
              id="con_password"
              value={con_password}
              onChange={(e) => setCon_Password(e.target.value)}
              required
              autoComplete="off"
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

export default Register;
