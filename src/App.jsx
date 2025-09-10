// App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FieldUserPortal from "./pages/FieldUserPortal";
import AdminPanel from "./pages/AdminPanel";
import TransparencyDashboard from "./pages/TransparencyDashboard";
import PublicMap from "./pages/PublicMap";
import Navbar from "./components/Navbar";

export default function App() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Mangrove Restoration A",
      organization: "Green Earth NGO",
      region: "Chennai Coast",
      area: 50,
      method: "plantation",
      vintage: 2023,
      credits: 1200,
      description: "Community-led mangrove plantation in coastal zone A.",
      image: "/images/admin/project1.jpg",
      status: "pending",
    },
    {
      id: 2,
      name: "Coastal Cleanup B",
      organization: "Blue Ocean Trust",
      region: "Marina Beach",
      area: 30,
      method: "natural_regeneration",
      vintage: 2022,
      credits: 800,
      description: "Plastic waste cleanup initiative with local schools.",
      image: "/images/admin/project2.jpg",
      status: "approved",
    },
    {
      id: 3,
      name: "Wetland Protection C",
      organization: "EcoCare",
      region: "Delta Zone",
      area: 20,
      method: "mixed",
      vintage: 2021,
      credits: 500,
      description: "Protecting and restoring wetlands in delta region.",
      image: "/images/admin/project3.jpg",
      status: "rejected",
    },
  ]);

  // ✅ NEW: Auth state
  const [user, setUser] = useState(null);

  const addProject = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
  };

  const updateStatus = (id, newStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  return (
    <div className="min-h-screen">
      {/* Pass user + setUser to Navbar */}
      <Navbar user={user} setUser={setUser} />

      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route index element={<Home />} />
          <Route path="login" element={<Login setUser={setUser} />} /> {/* ✅ pass setUser */}
          <Route path="register" element={<Register />} />

          <Route
            path="field-portal"
            element={<FieldUserPortal projects={projects} addProject={addProject} />}
          />
          <Route
            path="admin"
            element={<AdminPanel projects={projects} updateStatus={updateStatus} />}
          />
          <Route path="dashboard" element={<TransparencyDashboard />} />
          <Route path="map" element={<PublicMap />} />
        </Routes>
      </main>
    </div>
  );
}
