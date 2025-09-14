import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer as PieResponsive } from "recharts";
import { AreaChart, Area, XAxis, YAxis, Tooltip as AreaTooltip, ResponsiveContainer as AreaResponsive } from "recharts";

export default function TransparencyDashboard({ projects }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // 🔹 Filter + Search Logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.organization.toLowerCase().includes(search.toLowerCase()) ||
      p.region.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "all" ? true : p.status === filter;

    return matchesSearch && matchesFilter;
  });

  // 🔹 Pie Chart Data
  const statusData = [
    { name: "Approved", value: projects.filter(p => p.status === "approved").length },
    { name: "Pending", value: projects.filter(p => p.status === "pending").length },
    { name: "Rejected", value: projects.filter(p => p.status === "rejected").length },
  ];
  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  // 🔹 Area Chart Data (dummy for now, can be extended)
  const chartData = [
    { name: "Jan", credits: 1500 },
    { name: "Feb", credits: 2000 },
    { name: "Mar", credits: 1800 },
    { name: "Apr", credits: 2200 },
  ];

  const totalCredits = projects.reduce((sum, p) => sum + p.credits, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold mb-6 text-primary text-center">
        🌍 Transparency Dashboard
      </h2>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-6xl mx-auto">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <h3 className="text-lg font-semibold mb-4 text-center">Project Status</h3>
          <PieResponsive width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <PieTooltip />
            </PieChart>
          </PieResponsive>
        </div>

        {/* Area Chart */}
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <h3 className="text-lg font-semibold mb-4 text-center">Monthly Credits</h3>
          <AreaResponsive width="100%" height={250}>
            <AreaChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <AreaTooltip />
              <Area type="monotone" dataKey="credits" stroke="#1f6feb" fill="#cfe9ff" />
            </AreaChart>
          </AreaResponsive>
        </div>
      </div>

      {/* Search + Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center max-w-6xl mx-auto">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project, organization, or region"
          className="w-full md:w-1/2 border rounded-lg p-2"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="all">All Projects</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <p className="text-gray-500 text-center">No projects found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden border hover:shadow-xl transition"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.organization}</p>
                <p className="text-sm text-gray-600">{p.region}</p>
                <p className="text-sm font-semibold text-green-700 mt-2">
                  Carbon Credits: {p.credits}
                </p>
                <span
                  className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                    p.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : p.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {p.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
