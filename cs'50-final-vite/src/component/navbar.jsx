import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import Logout from "./logout";

import { AccountIcon } from "../assets/account-icon.jsx";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Navbar() {
  const { isLoggedIn } = useAuth();
  const login = isLoggedIn;

  const [logout_component, setLogout_Component] = useState(false);

  if (!login) {
    return (
      <nav>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </nav>
    );
  } else {
    return (
      <>
        <nav>
          <Link to="/">Home</Link>
          <Link onClick={() => setLogout_Component(true)}> Logout </Link>
          <Link to="/account">
            <AccountIcon />
          </Link>
        </nav>

        <Logout shown={logout_component} setShown={setLogout_Component} />
      </>
    );
  }
}

export default Navbar;
