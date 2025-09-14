import React from "react";
import { useParams, Link } from "react-router-dom";

export default function ProjectDetails({ projects }) {
  const { id } = useParams();
  const project = projects.find((p) => p.id === parseInt(id));

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-100">
        <p className="text-gray-600 text-lg">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-100 p-8 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-2xl"></div>

      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md border border-indigo-100 shadow-lg rounded-2xl overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-64 object-cover transform hover:scale-105 transition duration-500"
        />
        <div className="p-6">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-emerald-700 to-sky-800 mb-4">
            {project.name}
          </h2>
          <p className="text-gray-700 mb-6">{project.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p><strong>Organization:</strong> {project.organization}</p>
            <p><strong>Region:</strong> {project.region}</p>
            <p><strong>Area:</strong> {project.area} ha</p>
            <p><strong>Year:</strong> {project.vintage}</p>
            {project.credits !== undefined && (
              <p><strong>Credits:</strong> {project.credits}</p>
            )}
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === "approved"
                    ? "bg-gradient-to-r from-green-400 to-emerald-600 text-white"
                    : project.status === "pending"
                    ? "bg-gradient-to-r from-yellow-300 to-amber-500 text-gray-900"
                    : "bg-gradient-to-r from-red-400 to-pink-600 text-white"
                }`}
              >
                {project.status.toUpperCase()}
              </span>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 via-emerald-600 to-sky-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
