import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer as PieResponsive,
} from "recharts";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as AreaTooltip,
  ResponsiveContainer as AreaResponsive,
} from "recharts";

export default function TransparencyDashboard() {
  const [projects] = useState([
    {
      id: 1,
      name: "Mangrove Restoration A",
      organization: "Green Earth NGO",
      region: "Chennai Coast",
      credits: 1200,
      status: "approved",
      image: "./images/admin/project1.jpg",
    },
    {
      id: 2,
      name: "Coastal Cleanup B",
      organization: "Blue Ocean Trust",
      region: "Marina Beach",
      credits: 800,
      status: "pending",
      image: "./images/admin/project2.jpg",
    },
    {
      id: 3,
      name: "Wetland Protection C",
      organization: "EcoCare",
      region: "Delta Zone",
      credits: 500,
      status: "rejected",
      image: "./images/admin/project3.jpg",
    },
    {
      id: 4,
      name: "Coral Reef Revival D",
      organization: "OceanCare",
      region: "Andaman Islands",
      credits: 2200,
      status: "approved",
      image: "./images/mangrove1.jpg",
    },
    {
      id: 5,
      name: "Mangrove Planting E",
      organization: "Blue Carbon Trust",
      region: "Kerala Backwaters",
      credits: 1500,
      status: "pending",
      image: "./images/mangrove2.jpg",
    },
    {
      id: 6,
      name: "Salt Marsh Protection F",
      organization: "EcoDelta",
      region: "Sundarbans",
      credits: 950,
      status: "approved",
      image: "./images/mangrove2.jpg",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.organization.toLowerCase().includes(search.toLowerCase()) ||
      p.region.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "all" ? true : p.status === filter;

    return matchesSearch && matchesFilter;
  });

  const statusData = [
    { name: "Approved", value: projects.filter((p) => p.status === "approved").length },
    { name: "Pending", value: projects.filter((p) => p.status === "pending").length },
    { name: "Rejected", value: projects.filter((p) => p.status === "rejected").length },
  ];
  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  const chartData = [
    { name: "Jan", credits: 1500 },
    { name: "Feb", credits: 2000 },
    { name: "Mar", credits: 1800 },
    { name: "Apr", credits: 2200 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-teal-100 p-8">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-800 drop-shadow-md">
        Transparency Dashboard
      </h2>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-emerald-100 hover:shadow-2xl transition">
          <h3 className="text-lg font-semibold mb-4 text-center text-emerald-700">
            Project Status
          </h3>
          <PieResponsive width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={85}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="drop-shadow-md"
                  />
                ))}
              </Pie>
              <PieTooltip />
            </PieChart>
          </PieResponsive>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-sky-100 hover:shadow-2xl transition">
          <h3 className="text-lg font-semibold mb-4 text-center text-sky-700">
            Monthly Credits
          </h3>
          <AreaResponsive width="100%" height={250}>
            <AreaChart data={chartData}>
              <XAxis dataKey="name" stroke="#334155" />
              <YAxis stroke="#334155" />
              <AreaTooltip />
              <Area
                type="monotone"
                dataKey="credits"
                stroke="#0284c7"
                strokeWidth={3}
                fill="url(#colorCredits)"
              />
              <defs>
                <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </AreaResponsive>
        </div>
      </div>

      {/* Search + Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-center max-w-6xl mx-auto">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project, organization, or region"
          className="w-full md:w-1/2 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm"
        >
          <option value="all">All Projects</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <p className="text-gray-500 text-center italic">
          No projects found. Try adjusting your filters.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transform transition"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-44 object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.organization}</p>
                <p className="text-sm text-gray-600">{p.region}</p>
                <p className="text-sm font-semibold text-emerald-700 mt-3">
                  Carbon Credits: {p.credits}
                </p>
                <span
                  className={`inline-block mt-4 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                    p.status === "approved"
                      ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                      : p.status === "pending"
                      ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-gray-800"
                      : "bg-gradient-to-r from-red-400 to-red-600 text-white"
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
