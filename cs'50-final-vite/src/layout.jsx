import React from "react";
import Navbar from "./component/navbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const backendUrl = "http://localhost:5000";

function Layout() {
  const checkLogin = async () => {
    try {
      const res = await axios.get(`${backendUrl}/checklogin`, {
        withCredentials: true,
      });

      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Error:", err.response.data);
      }
      return false;
    }
  };

  return (
    <>
      <Navbar login={checkLogin} />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
