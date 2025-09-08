import React from "react";
import { motion } from "framer-motion";

export default function Card({project, onAction}){
  const statusColor = {
    verified: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700"
  }[project.status] || "bg-gray-100";

  return (
    <motion.div layout initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} className="bg-white rounded shadow-sm overflow-hidden">
      <img src={project.image} alt={project.title} className="w-full h-40 object-cover"/>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{project.title}</h3>
            <p className="text-xs text-gray-500">{project.region} • {project.submittedBy}</p>
          </div>
          <div className={`px-2 py-1 text-xs rounded ${statusColor}`}>{project.status.toUpperCase()}</div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm">Credits: <strong>{project.credits}</strong></div>
          <div className="space-x-2">
            {project.status === "pending" && <button onClick={()=>onAction('approve', project)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Approve</button>}
            {project.status === "pending" && <button onClick={()=>onAction('reject', project)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">Reject</button>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
