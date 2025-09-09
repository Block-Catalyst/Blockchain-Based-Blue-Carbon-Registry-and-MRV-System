import React from "react";
import { projects } from "../utils/dummyData";

export default function Home(){
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-10">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Blockchain-Based Blue Carbon MRV
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A transparent platform to track mangrove restoration, issue carbon credits, 
          and empower coastal communities.
        </p>
      </section>

      {/* Sample Projects */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">🌱 Sample Restoration Projects</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="relative group overflow-hidden rounded-lg shadow-lg">
              {/* Project Image */}
              <img 
                src={p.image} 
                alt={p.title} 
                className="w-full h-56 object-cover transform group-hover:scale-110 transition duration-500"
              />
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center 
                              text-white opacity-0 group-hover:opacity-100 transition duration-500">
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="text-sm mt-2 px-4 text-center">{p.description}</p>
                <span className={`mt-3 px-3 py-1 rounded text-xs font-semibold 
                  ${p.status === "verified" ? "bg-green-500" : p.status === "pending" ? "bg-yellow-500" : "bg-red-500"}`}>
                  {p.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
