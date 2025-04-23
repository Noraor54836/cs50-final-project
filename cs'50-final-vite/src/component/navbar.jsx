import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar({ login }) {
  if (!login) {
    return (
      <nav>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </nav>
    );
  } else {
    return (
      <nav>
        <Link to="/">Home</Link>
      </nav>
    );
  }
}

export default Navbar;
