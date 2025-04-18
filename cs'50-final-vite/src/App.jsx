import React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

import Home from "./component/home";
import Navbar from "./component/navbar";

function App() {
  return (
    <div className="App">
      <Home />
    </div>
  );
}

export default App;
