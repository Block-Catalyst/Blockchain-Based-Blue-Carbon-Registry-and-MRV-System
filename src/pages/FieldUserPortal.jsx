import React, { useState } from "react";

export default function FieldUserPortal() {
  const [projects, setProjects] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const newProject = {
      name: form.projectName.value,
      gps: form.gps.value,
      image: form.image.value.split("\\").pop(), // show file name only
    };

    setProjects([...projects, newProject]);
    form.reset(); // clear form after submit
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-6xl mx-auto">
      {/* Left Column - Form */}
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">
          🌱 Submit New Project
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              name="projectName"
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Upload Image</label>
            <input
              type="file"
              name="image"
              required
              className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">GPS Location</label>
            <input
              type="text"
              name="gps"
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Latitude, Longitude"
            />
          </div>

          {/* ✅ Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition"
          >
            🚀 Submit Project
          </button>
        </form>
      </div>

      {/* Right Column - Submitted Projects */}
      <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          📋 Submitted Projects
        </h2>
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects submitted yet.</p>
        ) : (
          <ul className="space-y-3">
            {projects.map((proj, idx) => (
              <li
                key={idx}
                className="p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-indigo-600">{proj.name}</h3>
                <p className="text-sm text-gray-600">📍 {proj.gps}</p>
                <p className="text-sm text-gray-500">🖼️ {proj.image}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
