// import React, {useState} from "react";
// import Card from "../components/Card";
// import { projects as initial } from "../utils/dummyData";
// import { motion } from "framer-motion";

// export default function AdminPanel(){
//   const [projects, setProjects] = useState(initial);

//   const handleAction = (action, project) => {
//     setProjects(prev => prev.map(p => {
//       if(p.id !== project.id) return p;
//       if(action === "approve") return {...p, status: "verified", credits: 1000};
//       if(action === "reject") return {...p, status: "rejected"};
//       return p;
//     }));
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
//       <div className="grid md:grid-cols-3 gap-4">
//         {projects.map(p => (
//           <Card key={p.id} project={p} onAction={handleAction} />
//         ))}
//       </div>

//       <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-6 bg-white p-4 rounded shadow">
//         <h4 className="font-semibold mb-2">Credits Issued (sample)</h4>
//         <div className="text-3xl font-bold">{projects.reduce((s,a)=>s+a.credits,0)}</div>
//       </motion.div>
//     </div>
//   )
// }
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function AdminPanel() {
  // Example mock data (replace with real API later)
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Mangrove Restoration A",
      image: "https://source.unsplash.com/400x250/?mangrove,forest",
      description: "Community-led mangrove plantation in coastal zone A.",
      status: "pending",
    },
    {
      id: 2,
      name: "Coastal Cleanup B",
      image: "https://source.unsplash.com/400x250/?beach,cleanup",
      description: "Plastic waste cleanup initiative with local schools.",
      status: "approved",
    },
    {
      id: 3,
      name: "Wetland Protection C",
      image: "https://source.unsplash.com/400x250/?wetland,eco",
      description: "Protecting and restoring wetlands in delta region.",
      status: "rejected",
    },
  ]);

  // Handle status update
  const updateStatus = (id, newStatus) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: newStatus } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Page Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent"
      >
        🛠️ Admin Panel — Project Approvals
      </motion.h1>

      {/* Project Cards Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
          >
            {/* Project Image */}
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-40 object-cover"
            />

            {/* Card Content */}
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800">
                {project.name}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {project.description}
              </p>

              {/* Status Badge */}
              <span
                className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : project.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {project.status.toUpperCase()}
              </span>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => updateStatus(project.id, "approved")}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(project.id, "pending")}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition"
                >
                  Pending
                </button>
                <button
                  onClick={() => updateStatus(project.id, "rejected")}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
