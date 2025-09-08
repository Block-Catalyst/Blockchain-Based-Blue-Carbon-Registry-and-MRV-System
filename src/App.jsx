import React from "react";
import { Routes, Route, Link, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import FieldUserPortal from "./pages/FieldUserPortal";
import AdminPanel from "./pages/AdminPanel";
import TransparencyDashboard from "./pages/TransparencyDashboard";
import Navbar from "./components/Navbar";

export default function App(){
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="field-portal" element={<FieldUserPortal />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="dashboard" element={<TransparencyDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
