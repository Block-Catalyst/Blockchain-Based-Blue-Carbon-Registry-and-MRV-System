import React, { useState } from "react";

export default function FieldUserPortal() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.image) return;

    const newProject = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      image: URL.createObjectURL(form.image),
    };

    setProjects([...projects, newProject]);
    setForm({ title: "", description: "", image: null });
    e.target.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold mb-8 text-primary text-center">Field User Portal</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side - Submit Project Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Submit New Project</h3>

          <div>
            <label className="block text-sm font-medium">Project Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder="Enter project title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Upload Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* ✅ Always Visible Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Submit Project
          </button>
        </form>

        {/* Right Side - Submitted Projects */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Submitted Projects</h3>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects submitted yet.</p>
          ) : (
            <div className="grid gap-6">
              {projects.map((p) => (
                <div key={p.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h4 className="font-bold">{p.title}</h4>
                    <p className="text-sm text-gray-600">{p.description}</p>
                    {/* 🚫 Removed Pending Badge */}
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
