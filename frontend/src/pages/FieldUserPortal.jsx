import React, { useState } from "react";

export default function FieldUserPortal({ addProject }) {
  const [form, setForm] = useState({
    name: "",
    organization: "",
    region: "",
    area: "",
    method: "",
    vintage: "",
    description: "",
    file: null,
    agree: false,
  });

  const [localProjects, setLocalProjects] = useState([]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === "file") {
      setForm({ ...form, file: files[0] });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.organization || !form.region || !form.file || !form.agree) {
      alert("Please fill all required fields and agree to terms.");
      return;
    }

    const newProject = {
      id: Date.now(),
      name: form.name,
      organization: form.organization,
      region: form.region,
      area: form.area,
      method: form.method,
      vintage: form.vintage,
      description: form.description,
      image: form.file ? URL.createObjectURL(form.file) : "",
      status: "pending",
    };

    addProject(newProject);
    setLocalProjects((prev) => [...prev, newProject]);

    setForm({
      name: "",
      organization: "",
      region: "",
      area: "",
      method: "",
      vintage: "",
      description: "",
      file: null,
      agree: false,
    });
    e.target.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-100 p-8 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-2xl"></div>

      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-emerald-700 to-sky-800 drop-shadow-xl">
        Register Blue Carbon Project
      </h2>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/90 backdrop-blur-md border border-indigo-100 shadow-lg rounded-2xl p-8"
        >
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Project Name"
            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="organization"
              value={form.organization}
              onChange={handleChange}
              placeholder="Organization"
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              name="region"
              value={form.region}
              onChange={handleChange}
              placeholder="Region / District"
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="number"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="Area (ha)"
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Method</option>
              <option value="plantation">Plantation</option>
              <option value="natural_regeneration">Natural Regeneration</option>
              <option value="mixed">Mixed Approach</option>
            </select>
            <input
              type="number"
              name="vintage"
              value={form.vintage}
              onChange={handleChange}
              placeholder="Vintage (year)"
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description / Species Mix / Notes"
            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload baseline evidence (GeoJSON, images, drone orthomosaic)
            </label>
            <input
              type="file"
              name="file"
              accept="image/*,.geojson"
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-600"
            />
            <label className="text-gray-700">
              I affirm data is accurate to my knowledge
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-emerald-600 to-sky-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition"
          >
            Submit for Review
          </button>
        </form>

        {/* Submitted Projects */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-emerald-700 to-sky-800 mb-4">
            Your Submitted Projects
          </h3>
          {localProjects.length === 0 ? (
            <p className="text-gray-500">No projects submitted yet.</p>
          ) : (
            <div className="grid gap-6">
              {localProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/90 backdrop-blur-md border border-indigo-100 shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition"
                >
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-44 object-cover transform hover:scale-105 transition duration-500"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-lg">{p.name}</h4>
                    <p className="text-sm text-gray-600">
                      {p.organization} | {p.region}
                    </p>
                    <p className="text-sm">
                      Area: {p.area} ha | Method: {p.method} | Year: {p.vintage}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
