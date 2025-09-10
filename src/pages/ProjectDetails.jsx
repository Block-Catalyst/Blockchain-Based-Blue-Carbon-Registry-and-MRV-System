import React from "react";
import { useParams, Link } from "react-router-dom";

export default function ProjectDetails({ projects }) {
  const { id } = useParams();
  const project = projects.find((p) => p.id === parseInt(id));

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <img src={project.image} alt={project.name} className="w-full h-64 object-cover" />
        <div className="p-6">
          <h2 className="text-3xl font-bold text-primary mb-4">{project.name}</h2>
          <p className="text-gray-700 mb-4">{project.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><strong>Organization:</strong> {project.organization}</p>
            <p><strong>Region:</strong> {project.region}</p>
            <p><strong>Credits:</strong> {project.credits}</p>
            <p><strong>Area:</strong> {project.area} ha</p>
            <p><strong>Year:</strong> {project.vintage}</p>
            <p><strong>Status:</strong> {project.status}</p>
          </div>

          <div className="mt-6">
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
