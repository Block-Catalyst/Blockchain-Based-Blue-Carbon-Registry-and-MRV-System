import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FieldUserPortal({ addProject }) {
  const [form, setForm] = useState({
    name: "",
    organization: "",
    region: "",
    area: "",
    method: "",
    vintage: "",
    credits: "",
    description: "",
    file: null, // will store verified image (base64)
    agree: false,
  });

  const [localProjects, setLocalProjects] = useState([]);
  const navigate = useNavigate();

  // ✅ Load verified image from CaptureUpload (if available)
  useEffect(() => {
    const verifiedImage = localStorage.getItem("verifiedImage");
    if (verifiedImage) {
      setForm((prev) => ({ ...prev, file: verifiedImage }));
      localStorage.removeItem("verifiedImage");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // ✅ Navigate to CaptureUpload for image verification
  const handleFileRedirect = () => {
    navigate("/capture-upload");
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
      credits: parseInt(form.credits) || 0,
      description: form.description,
      image: form.file, // ✅ base64 from CaptureUpload
      status: "pending",
    };

    addProject(newProject);
    setLocalProjects((prev) => [...prev, newProject]);

    // reset form
    setForm({
      name: "",
      organization: "",
      region: "",
      area: "",
      method: "",
      vintage: "",
      credits: "",
      description: "",
      file: null,
      agree: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold mb-8 text-primary text-center">
        Register Blue Carbon Project
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Project Name"
            className="w-full border rounded-lg p-2"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="organization"
              value={form.organization}
              onChange={handleChange}
              placeholder="Organization"
              className="w-full border rounded-lg p-2"
            />
            <input
              type="text"
              name="region"
              value={form.region}
              onChange={handleChange}
              placeholder="Region / District"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <input
              type="number"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="Area (ha)"
              className="w-full border rounded-lg p-2"
            />
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
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
              className="w-full border rounded-lg p-2"
            />
            <input
              type="number"
              name="credits"
              value={form.credits}
              onChange={handleChange}
              placeholder="Carbon Credits"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description / Species Mix / Notes"
            className="w-full border rounded-lg p-2"
          />

          {/* ✅ Image Verification Section */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload baseline evidence (GeoJSON, images, drone orthomosaic)
            </label>

            {/* Preview of verified image */}
            {form.file && (
              <img
                src={form.file}
                alt="Verified"
                className="mb-2 w-64 h-64 object-cover rounded-lg shadow"
              />
            )}

            <button
              type="button"
              onClick={handleFileRedirect}
              className={`w-full border rounded-lg p-2 ${
                form.file ? "bg-green-100 text-green-700" : "bg-gray-100"
              }`}
            >
              {form.file ? "✅ Image Verified" : "Upload & Verify Image"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            <label>I affirm data is accurate to my knowledge</label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Submit for Review
          </button>
        </form>

        {/* LOCAL PROJECT LIST */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Submitted Projects</h3>
          {localProjects.length === 0 ? (
            <p className="text-gray-500">No projects submitted yet.</p>
          ) : (
            <div className="grid gap-6">
              {localProjects.map((p) => (
                <div key={p.id} className="bg-white shadow rounded-lg overflow-hidden">
                  {p.image && (
                    <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <h4 className="font-bold">{p.name}</h4>
                    <p className="text-sm text-gray-600">{p.organization} | {p.region}</p>
                    <p className="text-sm">
                      Area: {p.area} ha | Method: {p.method} | Year: {p.vintage}
                    </p>
                    <p className="text-sm font-semibold text-green-700 mt-2">
                      Carbon Credits: {p.credits}
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
