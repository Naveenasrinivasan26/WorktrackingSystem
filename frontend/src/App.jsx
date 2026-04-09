import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ResetPassword from "./components/ResetPassword";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!savedUser || !token) return null;
    return JSON.parse(savedUser);
  });

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth-unauthorized", handleUnauthorized);
  }, []);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === "admin" ? "/admin" : "/user"} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/user/*"
          element={
            user && user.role === "user" ? (
              <UserDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/admin/*"
          element={
            user && user.role === "admin" ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;