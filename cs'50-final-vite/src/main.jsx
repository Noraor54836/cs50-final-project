import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import Layout from "./layout.jsx";

import Register from "./component/register.jsx";
import Login from "./component/login.jsx";
import Home from "./component/home.jsx";

import ProtectedRoute from "./context/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          { path: "/", element: <App /> },
          { path: "home", element: <Home /> },
        ],
      },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      ,
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
