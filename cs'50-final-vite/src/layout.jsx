import React from "react";
import Navbar from "./component/navbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Layout() {
  const checkLogin = async () => {
    try {
      const res = await axios.get(`${backendUrl}/checklogin`, {
        withCredentials: true,
      });

      if (res.data.authenticated === true) {
        return true;
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Error:", err.response.data);
        window.location.href = "/login";
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
