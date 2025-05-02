import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate, useNavigate } from "react-router-dom";

import StarBackground from "./starbg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Home() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const [usermain, setUsermain] = useState("");

  useEffect(() => {
    const getUsermain = async () => {
      console.log(user);
      try {
        const res = await axios.post(
          `${backendUrl}/getUsermain`,
          {
            userid: user,
          },
          {
            withCredentials: true,
          }
        );

        if (res.status === 200) {
          setUsermain(res.data.main);
        }
      } catch (err) {
        setUsermain("");
      }
    };

    getUsermain();
  }, []);

  return (
    <div className="container home">
      <div className="main_goal">
        <StarBackground content="home" user={usermain} />
      </div>
    </div>
  );
}

export default Home;
