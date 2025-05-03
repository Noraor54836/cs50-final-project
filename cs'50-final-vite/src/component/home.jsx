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

  const [userdata, setUserdata] = useState({});

  const { goal, start_date, end_date } = userdata;

  useEffect(() => {
    const getuserdata = async () => {
      console.log(user);
      try {
        const res = await axios.post(
          `${backendUrl}/getuserdata`,
          {
            userid: user,
          },
          {
            withCredentials: true,
          }
        );

        if (res.status === 200) {
          setUserdata(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    getuserdata();
  }, []);

  return (
    <div className="container home">
      <div className="main_goal">
        <StarBackground content="home" user={goal} />
      </div>
    </div>
  );
}

export default Home;
