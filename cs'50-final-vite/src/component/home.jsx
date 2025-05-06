import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useUserdata } from "../context/Userdata";

import StarBackground from "./starbg";
import Clock from "./clock";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Home() {
  const { user, isLoggedIn } = useAuth();
  const { Usermaindata } = useUserdata();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const { goal, start_date, end_date } = Usermaindata;

  return (
    <div className="container home">
      <div className="main_goal">
        <StarBackground content="home" user={goal} />
      </div>
      <div className="row-1-layout">
        <Clock />
      </div>
    </div>
  );
}

export default Home;
