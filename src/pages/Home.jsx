import React from "react";
import { Link } from "react-router-dom";

export default function Home({ projects }) {
  return (
    <div className="space-y-20 bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-100 min-h-screen relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-2xl"></div>

      {/* Hero */}
      <section className="relative text-center py-20 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-emerald-700 to-sky-800 drop-shadow-xl">
          Blockchain-Based Blue Carbon MRV
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          A transparent platform to track mangrove restoration, issue carbon credits,
          and empower coastal communities.
        </p>
      </section>

      {/* Projects */}
      <section className="px-6 md:px-12">
        <h2 className="text-3xl font-bold mb-12 text-gray-800 text-center">
          <span className="bg-gradient-to-r from-indigo-600 via-emerald-600 to-sky-600 text-transparent bg-clip-text">
            Sample Restoration Projects
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/project/${p.id}`}
              className="relative group rounded-2xl bg-white/90 backdrop-blur-md border border-indigo-100 shadow-lg overflow-hidden transform hover:-translate-y-3 hover:shadow-2xl hover:border-indigo-300 transition-all duration-500"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-60 object-cover transform group-hover:scale-110 transition duration-700 ease-out"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80 flex flex-col justify-center items-center text-white opacity-0 group-hover:opacity-100 transition duration-500 px-6 text-center">
                <h3 className="text-xl font-bold drop-shadow-md">{p.name}</h3>
                <p className="text-sm mt-3 opacity-90">{p.description}</p>
                <span
                  className={`mt-5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-md
                    ${
                      p.status === "approved"
                        ? "bg-gradient-to-r from-green-400 to-emerald-600"
                        : p.status === "pending"
                        ? "bg-gradient-to-r from-yellow-300 to-amber-500 text-gray-900"
                        : "bg-gradient-to-r from-red-400 to-pink-600"
                    }`}
                >
                  {p.status.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
